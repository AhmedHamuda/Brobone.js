define(['jquery', 'underscore', 'brobone', 'handlebars'], function ($, _, Brobone, Handlebars) {

    var ProfileView = Brobone.FormView.extend({
    	title: "Felhasználó Profil",
        className: 'panel panel-default',
        template: "#temp-view-profile"
    });

    return ProfileView;
});