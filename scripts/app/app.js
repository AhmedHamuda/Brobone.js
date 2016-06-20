define(['jquery', 'underscore', 'backbone', 'brobone', 'controllers/user-controller', 'controllers/photo-controller', 'controllers/statics-controller', 'appViews/menu-view', 'data/app-model'],
    function ($, _, Backbone, Brobone, UserController,PhotoController,StaticsController, MenuView, Model) {
    app = new Brobone.Application();
    app.registerController({
        name: "users",
        controller: UserController
    });
    app.registerController({
        name: "photos",
        controller: PhotoController
    });
    app.registerController({
        name: "statics",
        controller: StaticsController
    });

    app.on("start", function () {
        new MenuView({
            keepAlive: true,
            model: new Model.CurrentUser()
        });
    })

    var initialize = function () {
        app.start({ startRoute: "users/userlist" });
    }

    
    return { initialize: initialize };
})
