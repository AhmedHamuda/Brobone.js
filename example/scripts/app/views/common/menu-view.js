define(['jquery', 'underscore', 'backbone', 'marionette', 'handlebars'], function ($, _, Backbone, Marionette, Handlebars) {

    var MenuView = Marionette.ItemView.extend({
    	constructor: function(args){
    		Marionette.ItemView.prototype.constructor.call(this,args);
    		this.listenTo(this.model,'sync',this.render);
    	},
		el: '.container-fluid',
        template: Handlebars.compile($('#temp-view-menu').html()),
        events: {
        	'click [role="menu-item"]' : 'selectedItem' 
        },
    	selectedItem: function (event) {
    		if (event && event.currentTarget) {
    			this.$('[role="menu-item"]').removeClass('active');
				this.$(event.currentTarget).addClass('active');
			}
    	}
    });

    return MenuView;
});