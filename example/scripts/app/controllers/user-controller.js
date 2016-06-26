define(['jquery',
    'underscore',
    'backbone',
    'brobone',
    'data/app-collection',
    'data/app-model',
    'user/users-view',
    'user/user-form-view',], function ($, _, Backbone, Brobone, Collection, Model, UsersView, UserFormView) {
        var UserController = Brobone.Controller.extend({
            loadView: function (viewClass, options) {
                this.view && this.view.destroy();
                this.view = new viewClass(options);
            },
            userList: function () {
                var collection = new Collection.Users();
                collection.setQuery({ pager: { pageSize: 9 } });
                var models = [];
                var emails = ["ahmed@bro.com", "john@bro.com", "andres@bro.com"];
                var names = ["Ahmed Hamuda", "John Smith", "Andres Smith"];
                var cities = ["Budapest", "Prague", "Milano"];
                for (var i = 0; i < 10; i++) {
                    var rand = Math.floor((Math.random() * 3));
                    var model = new Model.Photo({
                        "id": i,
                        "name": names[rand],
                        "email": emails[rand],
                        "city": cities[rand],
                        "phone": "+363045439864",
                        "full": rand > 1
                    });
                    models.push(model);
                }
                collection.add(models);
                //collection.fetch();
                this.loadView(UsersView, { collection: collection });
            },
            user: function (id) {
                var model = new Model.User();
                new Collection.Users().add(model);
                if (id) {
                    model.set('id', id);
                    model.fetch();
                }
                this.loadView(UserFormView, { model: model });
                this.view.listenTo(this.model, 'sync', this.display);
            },
        });

        return UserController;
    });