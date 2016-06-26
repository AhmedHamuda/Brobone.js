(function(root, factory) {
    // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
    // We use `self` instead of `window` for `WebWorker` support.
    var root = (typeof self == 'object' && self.self == self && self) ||
              (typeof global == 'object' && global.global == global && global);

    // Set up Brobone appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define(['backbone', 'underscore','handlebars'], function(Backbone, _, Handlebars) {
            return (root.Brobone = factory(root, Backbone, _, Handlebars));
        });
    } 
        // Next for Node.js or CommonJS. jQuery may not be needed as a module.
    else if (typeof exports !== 'undefined') {
        var Backbone = require('backbone');
        var _ = require('underscore');
        var Handlebars = require('handlebars');
        module.exports = factory(root, Backbone, _, Handlebars);

        // Finally, as a browser global.
    } else {
        root.Brobone = factory(root, root.Backbone, root._, root.Handlebars);
    }

}(this, function(root, Backbone, _, Handlebars) {
    'use strict';
    // Save the previous value of the `Brobone` variable, so that it can be
    // restored later on, if `noConflict` is used.
    var previousBrobone = root.Brobone;
    var Brobone = Backbone.Brobone = {};
    // Current version of the library. Keep in sync with `package.json`.
    Brobone.VERSION = '0.0.1';
    // Runs Brobone.js in *noConflict* mode, returning the `Brobone` variable
    // to its previous owner. Returns a reference to this Brobone object.
    Brobone.noConflict = function() {
        root.Brobone = previousBrobone;
        return this;
    };

    // Trigger Method
    // --------------
    Brobone._triggerMethod = (function () {
        // split the event name on the ":"
        var splitter = /(^|:)(\w)/gi;

        // take the event section ("section1:section2:section3")
        // and turn it in to uppercase name
        function getEventName(match, prefix, eventName) {
            return eventName.toUpperCase();
        }

        return function (context, event, args) {
            var noEventArg = arguments.length < 3;
            if (noEventArg) {
                args = event;
                event = args[0];
            }

            // get the method name from the event name
            var methodName = 'on' + event.replace(splitter, getEventName);
            var method = context[methodName];
            var result;

            // call the onMethodName if it exists
            if (_.isFunction(method)) {
                // pass all args, except the event name
                result = method.apply(context, noEventArg ? _.rest(args) : args);
            }

            // trigger the event, if a trigger method exists
            if (_.isFunction(context.trigger)) {
                if (noEventArg + args.length > 1) {
                    context.trigger.apply(context, noEventArg ? args : [event].concat(_.drop(args, 0)));
                } else {
                    context.trigger(event);
                }
            }

            return result;
        };
    })();

    // Trigger an event and/or a corresponding method name. Examples:
    //
    // `this.triggerMethod("foo")` will trigger the "foo" event and
    // call the "onFoo" method.
    //
    // `this.triggerMethod("foo:bar")` will trigger the "foo:bar" event and
    // call the "onFooBar" method.
    Brobone.triggerMethod = function (event) {
        return Brobone._triggerMethod(this, arguments);
    };

    // Object
    // ------

    // A Base Class that other Classes should descend from.
    // Object borrows many conventions and utilities from Backbone.
    Brobone.Object = function (options) {
        this.options = _.extend({}, _.result(this, 'options'), options);

        this.initialize.apply(this, arguments);
    };

    Brobone.Object.extend = Backbone.Model.extend;
    _.extend(Brobone.Object.prototype, Backbone.Events, {

        //this is a noop method intended to be overridden by classes that extend from this base
        initialize: function () { },

        destroy: function (options) {
            options || (options = {})
            if (options.keepAlive) return;
            this.triggerMethod('before:destroy');
            this.stopListening();
            this.undelegateEvents();
            this.triggerMethod('destroy');
            return this;
        },

        // Import the `triggerMethod` to trigger events with corresponding
        // methods if the method exists
        triggerMethod: Brobone.triggerMethod
    });

    // Router
    // ------
    //Basically a Backbone router wich has a route pattern
    //route pattern has to have a ":controller" and ":action" pattern as like in the default route pattern
    //route pattern can be modified by passing it as an argument at application initialization
    //automatically listen to and call the specefic registered controller and action by name
    //supports custom route for controller action.
    Brobone.Router = Backbone.Router.extend({
        routePattern: ":controller/:action(/)(:id)",
        constructor: function (options) {
            options || (options = {});
            if (options.routePattern) this.routePattern = options.routePattern;
            this.Routing = {}
            this.listenTo(Brobone.controllerManager, "customRouting", this.bindRoutes);
            this.on('route', this.trackHistory);

            //if route pattern is acceptable, the pattern will be registered as a route for the router
            if (this.checkRouterPattern()) {
                this.route(this.routePattern);
                this.Routing.route = this._routeToRegExp(this.routePattern)
            } else {
                throw Error("routerPattern not correct. It has to contain ':controller' and ':action' keywords");
            }
        },
        //checks if the route pattern has ":controller" and ":action" keywords.
        //get the index of the keywords. this way the order of :controller and :action keywords will not be restricted
        checkRouterPattern: function () {
            var RouterComponents = this.routePattern.replace(/[^\w\s:/]/gi, '').split('/');

            this.Routing.Index = {
                controller: RouterComponents.indexOf(":controller"),
                action: RouterComponents.indexOf(":action")
            };
            return (this.Routing.Index.controller > -1 && this.Routing.Index.controller === RouterComponents.lastIndexOf(":controller")
                    && this.Routing.Index.action > -1 && this.Routing.Index.action === RouterComponents.lastIndexOf(":action"));
        },
        //backbone router route method
        route: function (route, name) {
            if (!_.isRegExp(route)) route = this._routeToRegExp(route);
            var router = this;
            Backbone.history.route(route, function (fragment) {
                var args = router._extractParameters(route, fragment);
                if (router.execute(route, args, fragment) !== false && name) {
                    router.trigger.apply(router, ['route:' + name].concat(args));
                    router.trigger('route', name, args);
                }
            });
            return this;
        },
        //passes the route and args, also checks if the route is custom route or not.
        execute: function (route, args, fragment) {
            Brobone.controllerManager.processRouting(route, args, this.Routing.Index, this.Routing.route.source != route.source);
        },
        //navigate to start page, at application start.
        start: function (options) {
            options || (options = {});
            if (options.startRoute) this.startRoute = options.startRoute;
            this.navigate(this.startRoute, { trigger: true });
        },
        trackHistory: function (name, args) {
            this.prevPage = this.currentPage;
            this.currentPage = {
                name: name,
                args: args,
                hash: Backbone.history.fragment
            }
        },
        //register custom routes after registering the controller
        bindRoutes: function (routes) {
            var routekey;
            var routeskeys = _.keys(routes);
            while ((routekey = routeskeys.pop()) != null) {
                this.route(routekey, routes[routekey]);
            }
        }
    });

    //Application
    //--------------------
    //

    Brobone.Application = Brobone.Object.extend({
        //initialize the controller manager and the router
        constructor: function (options) {
            this.options = _.extend({}, _.result(this, 'options'), options);
            Brobone.controllerManager = new Brobone.ControllerManager();
            Brobone.mainRouter = new Brobone.Router(this.options);
        },
        //check if controller class which to be registered to be passed in proper way with a name!!.
        //pass the controller to the controller manager
        registerController: function (regController) {
            if (!regController || !regController.controller || !regController.name || typeof(regController.name) !== "string") {
                throw Error("cannot register controller "+ regController.name);
                return false;
            }
            if (regController.controller.prototype instanceof Brobone.Controller) {               
                Brobone.controllerManager.add(regController);
            }
        },
        //start the backbone history and the router.
        //options can be passed throw the application start to history and router like this:
        // {
        //  router: {routePattern:....},
        //  history:{pushState: ....}
        //}
        // custom starting setups can be set before start and after start
        start: function (options) {
            this.options = _.extend({}, _.result(this, 'options'), options);
            this.triggerMethod("before:start");
            Backbone.history.start(options);
            Brobone.mainRouter.start(options);
            this.triggerMethod("start");
        },
        //check if controller class passed in proper way with a name!!.
        //pass the controller to the controller manager
        removeController: function (regController) {
            if (!regController || !regController.controller || !regController.name || typeof(regController.name) !== "string") {
                throw Error("cannot remove controller "+ regController.name);
                return false;
            }
            if (regController.controller.prototype instanceof Brobone.Controller) {
                Brobone.controllerManager.remove(regController);
            }
        }
    });

Brobone.Controller = Brobone.Object.extend({
    constructor: function (options) {
        options || (options = {});
        this._initalActionBuffer();
        this._resolveActions();
        this.listenTo(this,"execute",this._execute)
    },
    _initalActionBuffer: function(){
        this.actions = {};
    },
    _execute: function (action, args) {
        if (action && _.isFunction(this.actions[action])) {
            this.triggerMethod("before:action");
            this.actions[action].apply(this, args);
            this.triggerMethod("action");
        }
        else {
            throw "action is undefined or doesnt exist under this controller, action:" + action;
        }
    },
    _resolveActions: function() {
        for (var action in this) {
            if (_.isFunction(this[action]) &&
                action.lastIndexOf('_', 0) === -1 && !(/destroy/i.test(action) && /constructor/i.test(action))) {
                this.actions[action.toLowerCase()] = this[action];
            }
        }
    },
    destroy: function (options) {
        options || (options = {})
        if (options.keepAlive) return;
        this.view && this.view.destroy();
        this.triggerMethod('before:destroy');
        this.stopListening();
        this.triggerMethod('destroy');
        return this;
    }

});
Brobone.ControllerManager = Brobone.Object.extend({
    initialize: function () {
        this.controllers = {};
    },
    add: function (regController) {
        var controller = this.controllers[regController.name.toLowerCase()] = {
            controller: regController.controller,
            customRoutes: _.result(regController, 'customRoutes', false),
            instance: false
        };
        if (controller.customRoutes) {
            this.trigger("customRouting", controller.customRoutes);
        }
    },
    remove: function (name) {
        var controller = this._getController(name);
        if (!controller) {
            throw Error("no controller with this name: " + name);
            return;
        }
        this._destroyControllerInstance(controller.instance);
        return this.controllers[name];
    },
    _getController: function (name) {
        if (name) name = name.toLowerCase();
        return _.result(this.controllers, name);
    },
    _getCurrentController: function () {
        for (var controller in this.controllers) {
            if (this.controllers[controller].instance !== false) {
                return this.controllers[controller];
            }
        }
        return false;
    },
    _getCustomRoutingController: function (route, args) {
        for (var controller in this.controllers) {
            for (var fragment in this.controllers[controller].customRoutes) {
                if (route.test(fragment)) {
                    var controller = this.controllers[controller];
                    return { controller: controller, action: controller.customRoutes[fragment] };
                }
            }
        }
        return false;
    },
    _destroyControllerInstance: function (controllerInstance) {
        if (controllerInstance) {
            controllerInstance.destroy.call(this);
            return this;
        }
        return false;
    },
    _createControllerInstance: function (controller) {
        controller.instance = new controller.controller({manager: this});
        return controller.instance;
    },
    processRouting: function (route, args, routingIndexes, customRoute) {
        var controller, actionName, controllerName;
        if (customRoute) {
            var result = this._getCustomRoutingController(route, customRoute, args);
            if (result) {
                controller = result.controller;
                actionName = result.action;
            }
        }
        else {
            controllerName = args[routingIndexes.controller].toLowerCase(), actionName = args[routingIndexes.action].toLowerCase();
            args = _.without(args, controllerName, actionName);
            var controller = this._getController(controllerName);
        }
        if (!controller) throw Error("controller not found controller:" + controllerName);
        if (controller.instance) {
            controller.instance.trigger("execute", actionName, args);
        }
        else {
            var currentController = this._getCurrentController();
            currentController && this._destroyControllerInstance(currentController.instance);
            var instance = this._createControllerInstance(controller);
            this._setCurrentController(instance);
            instance.trigger("execute", actionName, args);
        }
    },
    _setCurrentController: function (controller) {
        this.currentController = controller;
    }
});
Brobone.Model = Backbone.Model.extend({
    constructor: function (args) {
        Backbone.Collection.prototype.constructor.call(this, args);
        this.initMode();
    },
    initMode: function () {
        this.mode = {
            pending: this.url() ? true : false,
            ready: this.url() ? false : true
        }
    },
    setMode: function (options) {
        this.mode = {
            pending: options.pending,
            ready: options.ready
        }
    },
    fetch: function (options) {
        this.setMode({ pending: true, ready: false });
        return Backbone.Model.prototype.fetch.call(this, options);
    }
});
/* Brobone collection*/
Brobone.Collection = Backbone.Collection.extend({
    /**/
    constructor: function (args) {
        Backbone.Collection.prototype.constructor.call(this, args);
        this.setDefaultQuery();
        this.initMode();
        this.on('reset', this.prepare);
        this.on('update', this.prepare);
        this.on('add', this.prepare);
        this.on('filter', this.beforeFilter);
        this.on('sort', this.beforeSort);
        this.on('page', this.beforePaging);
    },
    clientProcess: true,
    fetch: function (options) {
        options || (options = {});
        var data = options.data || {};
        if (options.useQuery === true) {
            data = _.extend(data, this.query);
        }
        //data = JSON.stringify(data);
        this.setMode({ pending: true, ready: false });
        return Backbone.Collection.prototype.fetch.call(this, { data: $.param(data), reset: true });
    },
    initMode: function () {
        if (this.url) {
            this.mode = { pending: true, ready: false }
        }
        else {
            this.mode = { pending: false, ready: true }
        }
       
    },
    setMode: function (options) {
        this.mode = {
            pending: options.pending,
            ready: options.ready
        }
    },
    setDefaultQuery: function () {
        var query = this.defaultQuery || {};
        this.query = {
            filter: query.filter || { properties: [], freeText: null },
            sort: query.sort || { rev: false, sortBy: "" },
            pager: query.pager || { pageSize: 10, numberOfPages: 0, current: 1 }
        }
    },
    setQuery: function (query) {
        query || (query = {});
        this.query = {
            filter: query.filter || this.query.filter,
            sort: query.sort || this.query.sort,
            pager: query.pager || this.query.pager
        };
        if (this.clientProcess) {
            this.process();
        }
    },
    prepare: function () {
        this.setMode({ pending: false, ready: true });
        this.allModel = this.models;
        this.setQuery();
    },
    process: function () {
        var query = this.query;
        var collection = this.allModel || this.models;
        if (collection && query) {
            collection = this.filter(collection, query.filter);
            collection = this.sort(collection, query.sort);
            collection = this.pagination(collection, query.pager);
        }
        this.models = collection;
        this.length = collection.length;
        this.trigger("ready");
        return this;
    },
    beforeFilter: function (type, filterObj) {
        if (filterObj && type) {
            var filter = this.query.filter;
            switch (type) {
                case "prop":
                    if (!filter.properties) filter.properties = [];
                    filter.properties = _.filter(filter.properties, function (prop) {
                        return prop.name != filterObj.name;
                    });
                    filter.properties.push(filterObj);
                    break;
                case "text":
                    filter.freeText = filterObj.text;
                    break;
            }
            this.setQuery({ filter: filter });
        }
    },
    filter: function (collection, filter) {
        if (filter && filter.properties) {
            filter.properties = _.filter(filter.properties, function (prop) {
                return prop.value !== "" && prop.value !== null;
            });
            var filtersObj = _.object(_.map(filter.properties, _.values));
            collection = (new Backbone.Collection(collection)).where(filtersObj);
        };

        if (filter && filter.freeText) {
            var self = this;
            var text = filter.freeText;
            var result = [];
            _.each(self.searchProps, function (prop) {
                result.push.apply(result, _.filter(collection, function (model) {
                    return model.attributes[prop].toLowerCase().indexOf(text.toLowerCase()) > -1;
                }));
            });
            result = _.uniq(result, function (item, index) {
                return item.id;
            })
            collection = result;
            this.trigger("filtered", filter);
        }
        return collection;
    },
    beforeSort: function (sortObj) {
        if (sortObj) {
            var sort = {
                sortBy: sortObj.sortBy,
                rev: sortObj.changeDirection ? !this.query.sort.rev : this.query.sort.rev,
                special: sortObj.special
            }
            this.setQuery({ sort: sort });
        }
    },
    sort: function (collection, sort) {
        if (sort) {
            if (sort.sortBy) {
                collection = _.sortBy(collection, function (model) {
                    return model.attributes[sort.sortBy];
                });
            }
            if (sort.rev) {
                collection = collection.reverse();
            }
            this.trigger("sorted", sort);
        }

        return collection;
    },
    pagination: function (collection, pager) {
        var lastNumberOfPages = this.query.pager.numberOfPages;
        this.query.pager.numberOfPages = collection.length > pager.pageSize ? Math.round(collection.length / pager.pageSize) : 1;
        if (lastNumberOfPages != this.query.pager.numberOfPages) {
            this.query.pager.current = 1;
        }
        collection = _.rest(collection, pager.pageSize * (pager.current - 1));
        collection = _.first(collection, pager.pageSize);
        this.trigger("paged", pager);
        return collection;
    },
    addWithoutTrigger: function (models, options) {
        options || (options = {});
        options.silent = true;
        Backbone.Collection.prototype.add.call(this, models, options);
    }
});
Brobone.CompiledTemplates = Brobone.CompiledTemplates || {};
Brobone.templateCache = {
    get : function (id) {
        return Brobone.CompiledTemplates[id];
    },
    set :function (id, compiler) {
        if ($(id).length == 0) {
            throw "template doesn't exist or not reachable. id: "+ id;
        }
        switch (compiler.toLowerCase()) {
            case "handlebars":
                Brobone.CompiledTemplates[id] = Handlebars.compile($(id).html());
                break;
            default:
                Brobone.CompiledTemplates[id] = _.template($(id).html());
                break;
        }
    },
    getCached : function (id, compiler) {
        if (!Brobone.CompiledTemplates[id]) {
            this.set(id, compiler)
        }
        return this.get(id);
    }
};
Brobone.View = Backbone.View.extend({
    triggerMethod: Brobone.triggerMethod,
    constructor: function (args) {
        this.type = "BaseView";
        Backbone.View.prototype.constructor.call(this, args);
        this.options = _.extend({}, args, this.options);
        this.setOptions();
        this.setSettings();
        this.bindEvents();
    },
    defaultSettings: {
        templateCompiler: "handlebars"
    },
    setOptions: function () {
        for (var prop in this.options) {
            this[prop] = this.options[prop];
        }
    },
    setSettings: function () {
        this.settings = _.extend({}, this.defaultSettings, this.settings);
    },
    bindEvents: function () {
        if (this.parent) {
            this.listenTo(this.parent, "destroy:child", this.destroy)
        }
    },
    render: function () {
        console.log("rendering " + this.cid + "type: ", this);
        this.triggerMethod('before:render');
        var data = this.mixinTemplateData();
        var html = this.compileTemplate(data);
        this.triggerMethod('render');
        this.animateIn(html);
        //this.bindViewId();
    },
    getTemplate: function () {
        if (!this.template) {
            throw Error("template is missing");
        }
        if (typeof (this.template) !== "string" && typeof (this.template) !== "function") {
            throw Error("template type is wrong");
        }
        return this.template;
    },
    compileTemplate: function (data) {
        var template = this.getTemplate();
        if (!_.isFunction(template)) {
            var template = Brobone.templateCache.getCached(template, this.settings.templateCompiler)
        }
        return template(data);
    },
    mixinTemplateData: function () {
        var data = this.model ? this.model.attributes : this.collection ? this.collection : {};
        if (this.templateHelpers) {
            data = _.extend(data, _.isFunction(this.templateHelpers) ? this.templateHelpers() : this.templateHelpers);
        }
        return data;
    },
    animateIn: function (html) {
        var animation = this.settings.animationIn;
        if (animation && !_.isEmpty(animation)) {
            if (typeof (animation.callback) === "function") {
                this.$el.hide().html(html);
                animation.callback.apply(this.$el, animation.args);
            }
            if (typeof (animation) === "string") {
                this.$el.addClass(animation).html(html);
            }
        } else {
            this.$el.html(html);
        }
    },
    animateOut: function () {
        var animation = this.settings.animationOut;
        if (animation && !_.isEmpty(animation)) {
            if (typeof (animation.callback) === "function") {
                animation.args.indexOf(this.emptyEl) === -1 && animation.args.push(this.emptyEl);
                animation.callback.apply(this.$el, animation.args);
            }
            if (typeof (animation) === "string") {
                this.$el.addClass(animation)
                this.$el.on(animation, function () {
                    this.emptyEl();
                })
            }
        } else {
            this.emptyEl();
        }
    },
    emptyEl: function(){
        var el = this.$el || $(this);
        el.empty();
    },
    destroy: function () {
        console.log("destroying " + this.cid + "type: ", this);
        if (this.keepAlive && (!this.parent || !this.parent._isDestroyed)) return;
        this.triggerMethod('before:destroy');
        this.triggerMethod('destroy:child');
        this.unbindEvents();
        this.animateOut();
        this.triggerMethod('destroy');
        this._isDestroyed = true;
        return this;
    },
    unbindEvents: function () {
        this.stopListening();
        this.undelegateEvents();
    }
});
//ItemView
//--------------
//
//Brobone view with rendering after initializing
Brobone.ItemView = Brobone.View.extend({
    constructor: function (args) {
        Brobone.View.prototype.constructor.call(this, args);
        this.render();
    }
});
Brobone.ListItemView = Brobone.View.extend({
    //clone the el to myEl.
    //empty the el (because it doesn't exist in the dom yet).
    //render the view.
    constructor: function (args) {
        this.myEl = _.clone(this.el);
        this.el = null;
        Brobone.View.prototype.constructor.call(this, args);
        this.type = "ListItemView";
        this.render();
    },
    //render the list item view.
    //append the list item to the list view.
    render: function () {
        console.log("rendering " + this.cid + " type: " + this.type);
        this.triggerMethod("before:render");
        var data = this.mixinTemplateData();
        var html = this.compileTemplate(data);
        this.triggerMethod("render");
        this.appendToList(html);
        this.animateIn();
    },
    appendToList: function (html) {
        if (this.parent) {
            this.parent.$el.append(html);
            this.setEl();
        }
    },
    //set the "el" by getting the el value from myEl which doesn't have cid property yet
    //it's important to only get the current appended element.
    //set the cid attributes to the el.
    //tell backbone about el change by calling setElement.
    setEl: function(){
      //  this.setElement();
        this.$el = this.parent.$(this.myEl).not('[cid]');
        this.$el.attr("cid", this.cid);
        this.setElement(this.$el);
    },
    //animate the shoing of the elenemt if the view settings has animateIn property.
    //animateIn can be an object which has callback and args properties,
    //---"callback" is any animation function that can be called on the element,
    //---"args" are the params which will be passed to the callback.
    //animateIn can be css3 animation passed as css class name string.
    animateIn: function(){
        var animation = this.settings.animationIn;
        if (animation && !_.isEmpty(animation)) {
            if (typeof (animation.callback) === "function") {
                this.$el.hide();
                animation.callback.apply(this.$el, animation.args);
            }
            if (typeof (animation) === "string") {
                this.$el.addClass(animation);
            }
        }
    },
    //unbindEvents the events form the view.
    // animate the view out.
    destroy: function () {
        console.log("destroying " + this.cid + " type: "+ this.type);
        this.unbindEvents();
        this.animateOut();
        this._isDestroyed = true;
        return this;
    },
    //remove the element form the DOM.
    emptyEl: function () {
        var el = this.$el || $(this);
        el.remove();
    }
});
Brobone.ListView = Brobone.View.extend({
    constructor: function (args) {
        Brobone.View.prototype.constructor.call(this, args);
        this.type = "ListView";
        this.listenTo(this.collection, 'ready', this.render);
        this.intialChildBuffer();
        this.render();
    },
    intialChildBuffer: function(){
        this._childViews = [];
    },
    render: function () {
        this.destroyChildren();
        this.destroyEmptyView()
        if (this.renderEmptyView()) return;
        Brobone.View.prototype.render.call(this);
        if (this.collection && this.collection.models.length) {
            this.renderChildren();
        }
    },
    renderEmptyView: function () {
        if ((!this.collection || !this.collection.length) && this.emptyView) {
            this._emptyView = new this.emptyView({ collection: this.collection });
            return true;
        }
        return false;
    },
    renderChildren: function () {
        var self = this;
        this.triggerMethod('before:render:list:children');
        _.each(this.collection.models, function (model) {
            self._childViews.push(self._renderChild(model));
        });
        this.triggerMethod('render:list:children');
    },
    _renderChild: function (model) {
        var child = new this.childView({ parent: this, model: model });
        return child;
    },
    destroyChildren: function () {
        var self = this;
        this.triggerMethod('before:destroy:list:child');
        if (!this._childViews || !this._childViews.length) return;
        _.each(this._childViews, function (view) {
            view.destroy && view.destroy();
            self._childViews = _.without(self._childViews,view);
        });
        this.triggerMethod('destroy:list:child');
    },
    destroyEmptyView: function () {
        if (!this._emptyView) return;
        this._emptyView.destroy && this._emptyView.destroy();
        this._emptyView = null;
    }
});

Brobone.WrapperView = Brobone.View.extend({
    constructor: function (args) {
        Brobone.View.prototype.constructor.call(this, args);
        this.type = "WrapperView";
        this.render();
    },
    render: function () {
        this.destroyChildren();
        Brobone.View.prototype.render.call(this);
        this.renderChildren();
    },
    renderChildren: function () {
        var self = this;
        _.each(this.childViews, function (_childView) {
            self.renderChild(_childView)
        });
    },
    renderChild: function (_view) {
        if (_view) {
            return (new _view({ collection: this.collection, parent: this }));
        }
    },
    destroyChildren: function () {
        var self = this;
        this.triggerMethod('destroy:child');
    },
});

//Form view
//--------------------
//
Brobone.FormView = Brobone.View.extend({
    //sets the view type
    //register the main form input validation functions
    //render the form based on the model id (display mode if the model has id or edit mode if not)
    constructor: function (args) {
        Brobone.View.prototype.constructor.call(this, args);
        this.type = "FormView";
        this._registerMainValidation();
        if (this.model && this.model.id) this.display();
        else this.edit();

    },
    //selects the template based on the mode (display or edit)
    templateSelector: function (type) {
        if (_.isObject(this.template)) {
            return this.template[type];
        }
        else {
            return this.template;
        }
    },
    //render the form in display mode
    display: function () {
        var baseTemplate = _.clone(this.template);
        this.template = this.templateSelector("display");
        this.render();
        this.template = baseTemplate;
    },
    //render the form in edit mode
    //set the input field's value based on the model attributes
    //triggers the bindControl method if there is any control that has to be bind to the input field, like jquery datepickers
    edit: function () {
        var baseTemplate = _.clone(this.template);
        this.template = this.templateSelector("edit");
        this.render();
        this.template = baseTemplate;
        this.setFormData(this.model);
        this.triggerMethod("bindControls");
    },
    //bindIdToHtml: function() {
    //    var self = this;
    //    this.$("input[data-field], textarea[data-field], select[data-field], hidden[data-field]").each(function (i,e) {
    //        self.$(e).attr("data-input-id",self.model.cid + )
    //    }
    //},
    //read and validate the input field values
    // validation can be skipped if skipValidation param is true
    getFormData: function (skipValidation) {
        var formData = {};
        invalidform = false;
        this.$("input:text[data-field], textarea[data-field], select[data-field], hidden[data-field]").each(function (i, e) {
            if (!self.validateElement(e) || skipValidation) {
                formData[$(e).attr("data-field")] = $(e).val() || null;
            } else {
                invalidform = true;
            }
        });

        this.$("select[data-field]").each(function (i, e) {
            if (!self.validateElement(e) || skipValidation) {
                formData[$(e).attr("data-field")] = $(e).val() == "true" ? true : $(e).val() == "false" ? false : $(e).val() || null;
            } else {
                invalidform = true;
            }
        });

        this.$("input:text[data-field][data-ctrl='datePicker']").each(function (i, e) {
            if (!self.validateElement(e) || skipValidation) {
                try {
                    formData[$(e).attr("data-field")] = $(e).val() ? new Date($(e).val()) : null;
                } catch (e) {
                    formData[$(e).attr("data-field")] = null;
                }
            } else {
                invalidform = true;
            }
        });

        this.$("input:checkbox[data-field]").each(function (i, e) {
            if (!self.validateElement(e) || skipValidation) {
                formData[$(e).attr("data-field")] = $(e).prop('checked');
            } else {
                invalidform = true;
            }
        });

        formData = invalidform == true ? null : formData;
        return formData;
    },
    //set the input field values based on the model attriubtes.
    //can be extended with special inputs
    setFormData: function (model) {
        this.$("input:text[data-field], textarea[data-field], select[data-field], hidden[data-field]").each(function (i, e) {
            self.$(e).val(model.get(self.$(e).attr('data-field')));
        });

        this.$("input:checkbox[data-field]").each(function (i, e) {
            self.$(e).prop('checked', model.get(self.$(e).attr('data-field')));
        });
    },
    //validates the values of the input fields.
    //triggers the clear error function to clear the errors displayed on the screen
    //trigger the decorate input function for any custom input decoration vor valid and not valid states
    //return the error object 
    validateElement: function (e) {
        if (e) {
            var element = e.currentTarget;
            this.triggerMethod("clear:error", element)
            var error = this.validate(this, element);
            this.triggerMethod("decorate:input", element, error);
            error && this.triggerMethod("show:error", error);//this.showError(error);
        }
        return error;
    },
    //validate the input value
    //it's called for every input element
    //get the validations on the input form the data-validate HTML attribute as default or from custom attribute
    //which has been set in the form settings.
    //call the validation based on the "key" which is the key of registered validation.
    //return the validation key and the element. for example: {validation:"req", element: element object}
    validate: function (self, element) {
        var validationAttrs = self.$(element).attr("data-validate");
        var validators = validationAttrs && validationAttrs.split(' ');
        var value = self.$(element).val();
        if (validators) {
            for (var i = 0; i < validators.length; i++) {
                var result = this.validations[validators[i]].call(self, element, value);
                if (result) {
                    return {validation: validators[i], element: element };
                }
            }
        }
        return false;
    },
    //add the validation name and callback to the global "validations" object.
    registerValidation: function (name, callback) {
        if (typeof (name) === "string" && typeof (callback) === "function") {
            this.validations[name] = callback;
        }
        else {
            throw Error("registering validation failed, check the validation type or callback, name: " + name)
        }
    },
    //register a list of important validtions using the registerValidation function.
    _registerMainValidation: function () {
       this.validations = [];
       this.registerValidation("req", function (element, value) {
            if (!value || value == "" || value == null) {
                return true;
            }
            return false;
        });
        //get the minimum length form the "data-min-len" HTML input attribute.
        this.registerValidation("minlen", function (element, value) {
            var minLen = self.$(element).attr("data-min-len");
            if (!minLen || !$.isNumeric(minLen)) {
                throw Error("element doesnt have data-min-len attribute or the attributes is not numeric");
            }
            if (value.length < parseInt(minLen)) {
                return true;
            }
            return false;
        });
        //get the maximum length form the "data-min-len" HTML input attribute.
       this.registerValidation("maxlen", function (element, value) {
            var maxLen = self.$(element).attr("data-max-len");
            if (!self.$(maxLen) || !$.isNumeric(maxLen)) {
                throw Error("element doesnt have data-max-len attribute or the attributes is not numeric");
            }
            if (value.length > parseInt(maxLen)) {
                return true;
            }
            return false;
        });

        this.registerValidation("num", function (element, value) {
            if (!value.match(/^\d+$/)) {
                return true;
            }
        });

        this.registerValidation("date", function (element, value) {
            try {
                Date.parse(value);
                return false;
            } catch (e) {
                return true;
            }
        });

        this.registerValidation("datetoday", function (element, value) {
            try {
                var date = Date.parse(value);
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date > today) {
                    return true;
                }
                return false;
            } catch (e) {
                return true;
            }
        });
    },
    //saving model
    //validate the whole form... if valid:
    //-the model attributes get modified by the form data.
    //-if model has url then it gets sent to the server.
    //-passing wait to the function will cause waiting to the server response.
    //-triggers the save success function on successful server saving.
    //-triggers the save error function on failed server saving.
    //-add the model to the collection if the model is new
    //-triggers the save model function.
    //
    //if not triggers the invalidForm function for any further error displaying regarding the whole form.
    save: function (options) {
        options || (options = {});
        var self = this;
        var formData = this.getFormData();
        var isNew = this.model.isNew();
        if (formData) {
            this.triggerMethod("before:save:model");
            this.model.set(formData);
            if (this.model.url()) {
                this.model.save(null, {
                    wait: options.wait,
                    success: function (xhr, model) {
                        self.triggerMethod("save:success", xhr, model);
                    },
                    error: function (xhr) {
                        self.triggerMethod("save:error", xhr);
                    }
                });
            } else {
                if (isNew && this.collection && !this.model.collection) {
                    this.collection.add(this.model);
                }
            }
            this.triggerMethod("save:model");
        } else {
            this.triggerMethod("invalidForm");
        }
    },
    //if model has url then deleting request get sent to the server
    //else it will be removed from the collection.
    deleteItem: function () {
        this.triggerMethod("before:destroy:model");
        if (this.model.url()) {
            this.model.destroy();
        } else {
            this.model.collection.remove();
        }
        this.triggerMethod("destroy:model");
    },
    close: function () {
        this.destroy();
    }
});

Brobone.Common = {};

Brobone.Common.ErrorView = Brobone.View.extend({
    constructor: function (args) {
        Brobone.View.prototype.constructor.call(this,args);
        this.prepareModel();
        this.render();
    },
    prepareModel: function () {
        this.model = new Backbone.Model();
        this.model.set('errorMsg', this.errorMesseges[this.error.validation]);
    },
    render: function () {
        this.$el.attr("data-field", $(this.error.element).attr("data-field"));
        Brobone.View.prototype.render.call(this);
    }
});

Brobone.Common.FilterView = Brobone.ItemView.extend({
    constructor: function (args) {
        Brobone.ItemView.prototype.constructor.call(this, args);
        this.listenTo(this.collection, "filtered", this.onFilter);
    },
    events: {
        'click button[data-button-id="filter"]': 'buttonFilter',
        'keyup input[data-input-id="search-input"]': 'liveInput'
    },
    buttonFilter: function (event) {
        if (event && event.currentTarget) {
            var property = this.$(event.currentTarget).attr('data-button-prop');
            var value = this.$(event.currentTarget).attr('data-button-value');
            this.filterProp(property, value);
            this.$('button[data-button-id="filter"][data-button-prop="' + property + '"]').removeClass("active");
            this.$(event.currentTarget).addClass("active");
        }
    },
    liveInput: function (event) {
        if (event && event.currentTarget) {
            var text = $(event.currentTarget).val();
            this.liveSearch(text);
        }
    },
    filterProp: function (prop, value) {
        if (value == "true" || value == "false") {
            value = value === "true" ? true : false;
        }
        if (_.isNumber(value)) {
            value = parseInt(value);
        }

        this.collection.trigger("filter", "prop", { prop: prop, value: value }); // setQuery({filter: filter});
    },
    liveSearch: function (text) {
        this.collection.trigger("filter", "text", { text: text });
    },
    onFilter: function (filter) {

    }
});

Brobone.Common.PagerView = Brobone.ItemView.extend({
    constructor: function (args) {
        Brobone.ItemView.prototype.constructor.call(this, args);
        this.listenTo(this.collection, 'ready', this.render);
    },
    events: {
        'click [data-button-id="prev-page"] ': 'prevPage',
        'click [data-button-id="next-page"] ': 'nextPage'
    },
    templateHelpers: function () {
        return {
            page: this.collection.query.pager,
            disable: this.collection.query.pager.numberOfPages <= 1
        }
    },
    prevPage: function (e) {
        var pager = this.collection.query.pager;
        if (pager.current > 1) {
            pager.current--;
            this.collection.setQuery({ pager: pager });
        }
    },
    nextPage: function (e) {
        var pager = this.collection.query.pager;
        if (pager.current < pager.numberOfPages) {
            pager.current++;
            this.collection.setQuery({ pager: pager });
        }
    }
});

Brobone.Common.SortView = Brobone.ItemView.extend({
    constructor: function (args) {
        Brobone.ItemView.prototype.constructor.call(this, args);
        this.listenTo(this.collection, "sorted", this.onSort);
    },
    events: {
        'click [data-button-id="sort"]': 'buttonSort',
    },
    buttonSort: function (event) {
        if (event && event.currentTarget) {
            var property = this.$(event.currentTarget).attr('data-button-prop');
            this.sort(property);
        }
    },
    sort: function (prop) {
        this.collection.trigger("sort", { sortBy: prop, changeDirection: true });
    },
    onSort: function (sort) {
        this.$('[data-button-id="sort"]  >span').removeClass("glyphicon glyphicon-menu-down glyphicon-menu-up");
        if (sort.rev) {
            this.$('[data-button-id="sort"][data-button-prop="' + sort.sortBy + '"] ' + ' >span').toggleClass("glyphicon glyphicon-menu-up");
        }
        else {
            this.$('[data-button-id="sort"][data-button-prop="' + sort.sortBy + '"] ' + ' >span').toggleClass("glyphicon glyphicon-menu-down");
        }
    }
});
return Brobone;
}));


