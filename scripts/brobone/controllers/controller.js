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