define(['jquery', 'underscore', 'backbone', 'marionette', 'handlebars'], function ($, _, Backbone, Marionette, Handlebars) {

    var SortView = Marionette.ItemView.extend({
        events: {
        	'click button[data-button-id="sort"]': 'buttonSort',
        },
        buttonSort: function (event) {
            if (event && event.currentTarget) {
            	this.$('button[data-button-id="sort"]  >span').removeClass("glyphicon glyphicon-menu-down glyphicon-menu-up");
                var property = this.$(event.currentTarget).attr('data-button-prop');
                var sort = this.sort(property);
                if (sort.rev) {
                	this.$('button[data-button-id="sort"][data-button-prop="' + property + '"] '+ ' >span').toggleClass("glyphicon glyphicon-menu-up");
				}
                else {
                	this.$('button[data-button-id="sort"][data-button-prop="' + property + '"] '+ ' >span').toggleClass("glyphicon glyphicon-menu-down");
				} 
            }
        },
        sort: function (prop) {
            var sort = this.collection.query.sort;
            sort.sortBy = prop;
            sort.rev = !sort.rev;
            sort.special = prop == "name";
            this.collection.setQuery({ sort: sort });
            return sort
        }
    });

    return SortView;
});