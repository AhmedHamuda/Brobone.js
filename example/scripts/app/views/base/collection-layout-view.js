define(['jquery', 'underscore', 'backbone', 'marionette', 'base/baseView','handlebars'], function ($, _, Backbone, Marionette,BaseView, Handlebars) {

    var CollectionLayoutView = BaseView.extend({
        constructor: function (args) {
            BaseView.prototype.constructor.call(this, args);
            this.childViews = [];
            this._childViews = args.childViews;
            this.render();
        },
        templateHelpers: function () {
            return {
                title: this.title,
                collection: this.collection,
                page: this.collection.query.page
            }
        },
        render: function(){
            BaseView.prototype.render.call(this);
            this.onRender()
        },
        onRender: function () {
            var self = this;
            _.each(this._childViews, function (_childView) {
                self.setChildView(_childView)
            });
        },
        setChildView: function (_view){
        	if (_view) {
        	    var child = new _view({ collection: this.collection });
        	    this.childViews.push(child);
            	child.parent = this;
            	child.render();
            	return child;
			}
        },
        onBeforeDestroy: function () {
            _.each(this.childViews, function (childView) {
                if (childView.destroy) {
                    childView.destroy();
                }
            })
        }
    });

    return CollectionLayoutView;
});