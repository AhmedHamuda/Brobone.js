define(['jquery', 'underscore', 'backbone', 'marionette', 'handlebars'], function ($, _, Backbone, Marionette, Handlebars) {

    var FilterView = Marionette.ItemView.extend({
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
        filterProp: function(prop, value) {
        	var filter = this.collection.query.filter;
        	if (value == "true" || value == "false" ) {
				value = value === "true" ? true : false;   
			}
        	if (_.isNumber(value)) {
				value = parseInt(value);
			}
        	filter.properties[prop] = value;
        	this.collection.setQuery({filter: filter});
        },
        liveSearch: function(text){
        	var filter = this.collection.query.filter;
        	filter.freeText = text;
        	this.collection.setQuery({filter: filter});
        }
    });

    return FilterView;
});