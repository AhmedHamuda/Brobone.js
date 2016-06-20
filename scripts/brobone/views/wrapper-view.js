
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