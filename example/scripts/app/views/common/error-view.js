define(['jquery', 'underscore', 'backbone', 'marionette', 'handlebars'], function ($, _, Backbone, Marionette, Handlebars) {

    var ErrorView = Marionette.ItemView.extend({
	    constructor: function(args) {
	    	Marionette.ItemView.prototype.constructor.call(this,args);
	    	this.element = this.options.error.element;
	    	this.render();
	    },
	    render: function(){
	    	this.prepareModel();
	    	 Marionette.ItemView.prototype.render.call(this);
	    },
	    prepareModel: function() {
    		this.model = new Backbone.Model();
    		this.model.set('errorMsg', this.errorMesseges[this.options.error.validation]);
	    },
    });

    return ErrorView;
});