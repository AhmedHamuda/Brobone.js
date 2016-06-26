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