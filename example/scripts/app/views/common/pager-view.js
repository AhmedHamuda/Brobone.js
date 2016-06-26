define(['jquery', 'underscore', 'backbone', 'marionette', 'handlebars'], function ($, _, Backbone, Marionette, Handlebars) {

    var PagerView = Marionette.ItemView.extend({
        constructor: function (args) {
        	Marionette.ItemView.prototype.constructor.call(this, args);
        	this.listenTo(this.collection, 'ready', this.render);
        },
        events: {
        	'click [data-button-id="prev-page"] ' : 'prevPage',
        	'click [data-button-id="next-page"] ' : 'nextPage'
        },
        templateHelpers: function() {
            return { 
            	page: this.collection.query.page,
            	disable: this.collection.query.page.numberOfPages <= 1
            }
        },
        prevPage: function (e) {
            e.stopPropagation();
        	var page = this.collection.query.page;
        	if (page.current > 1) {
        		page.current--;
        		this.collection.setQuery({page: page});
			}
        },
        nextPage: function (e) {
            e.stopPropagation();
        	var page = this.collection.query.page;
        	if (page.current < page.numberOfPages) {
        		page.current++;
        		this.collection.setQuery({page: page});
			}
        }
    });

    return PagerView;
});