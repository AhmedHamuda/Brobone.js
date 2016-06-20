define(['jquery', 'underscore', 'brobone', 'handlebars'], function ($, _, Brobone, Handlebars, FormView) {

    var PasswordView = Brobone.FormView.extend({
    	title: "Jelszó módosítása",
        className: 'panel panel-default',
        template: "#temp-view-password"
    });

    return PasswordView;
});