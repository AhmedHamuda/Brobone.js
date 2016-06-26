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