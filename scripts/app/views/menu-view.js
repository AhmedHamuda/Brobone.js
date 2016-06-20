define(['jquery', 'underscore', 'brobone'], function ($, _, Brobone) {

    var MenuView = Brobone.ItemView.extend({
        constructor: function (args) {
            Brobone.ItemView.prototype.constructor.call(this, args);
            this.listenTo(this.model, 'sync', this.render);
        },
		el: '.container-fluid',
        template: '#temp-view-menu',
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