define(['jquery', 'underscore', 'backbone', 'marionette','handlebars', 'base/item-form-view'], function ($, _, Backbone, Marionette,Handlebars, ItemFormView) {

    var PasswordView = ItemFormView.extend({
    	title: "Jelszó módosítása",
        className: 'panel panel-default',
        template: Handlebars.compile($("#temp-view-password").html())
    });

    return PasswordView;
});