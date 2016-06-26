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
