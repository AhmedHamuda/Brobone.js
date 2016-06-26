define(['jquery', 'underscore', 'backbone', 'marionette','handlebars', 'base/item-form-view'], function ($, _, Backbone, Marionette,Handlebars, ItemFormView) {

    var ProfileView = ItemFormView.extend({
    	title: "Felhasználó Profil",
        className: 'panel panel-default',
        template: Handlebars.compile($("#temp-view-profile").html())
    });

    return ProfileView;
});