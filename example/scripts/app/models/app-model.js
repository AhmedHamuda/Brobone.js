define(['underscore', 'backbone'], function (_, Backbone) {
    var User = Backbone.Model.extend({
        idAttribute: 'id'
    });

    var Photo = Backbone.Model.extend({
        idAttribute: 'id'
    });

    var CurrentUser = Backbone.Model.extend({
        idAttribute: 'id',
    	constructor: function(args){
    		Backbone.Model.prototype.constructor.call(this,args);
    		this.fetch();
    	},
    	urlRoot: 'api/User/authenticateduser'
    });
    return { CurrentUser: CurrentUser, User: User, Photo: Photo };
});