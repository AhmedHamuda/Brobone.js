
define(['jquery', 'underscore', 'backbone', 'marionette'], function ($, _, Backbone, Marionette) {

    var BaseView = Marionette.ItemView.extend({
        constructor: function(args) {
            Marionette.ItemView.prototype.constructor.call(this,args);
        },
        destroy: function () {
            if (this.isDestroyed) { return this; }
            var args = _.toArray(arguments);
            this.triggerMethod.apply(this, ['before:destroy'].concat(args));
            this.isDestroyed = true;
            this.triggerMethod.apply(this, ['destroy'].concat(args));
            this.unbindUIElements();
            this.isRendered = false;
            this.remove();
            _.invoke(this._behaviors, 'destroy', args);
            delete this;
            return this;
        },
        remove: function () {
            this.stopListening();
            this.el.empty();
        }
    });

    return BaseView;
});
