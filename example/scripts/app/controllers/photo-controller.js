define(['jquery',
    'underscore',
    'backbone',
    'brobone',
    'data/app-collection',
    'data/app-model',
    'photo/photos-view',
    'photo/photo-form-view', ], function ($, _, Backbone, Brobone, Collection, Model, PhotosView, PhotoFormView) {
        var PhotoController = Brobone.Controller.extend({
            loadView: function (viewClass, options) {
                this.view && this.view.destroy();
                this.view = new viewClass(options);
            },
            photoList: function () {
                var collection = new Collection.Photos();
                collection.setQuery({ pager: { pageSize: 9 } });
                //collection.fetch();
                var models = [];
                var names = [ "CEO_cat", "work", "evo_dog" ];
                var titles = [ "What do you mean, I'm the CEO?!", "Normal day at work", "Evolution or design?" ];
                for (var i = 0; i < 10; i++) {
                    var rand = Math.floor((Math.random() * 3));
                    var model = new Model.Photo({
                        id : i,
                        title : titles[i],
                        imgurl: "../content/images/" + names[rand] + ".jpg",
                        votes :  Math.floor((Math.random() * 2000) + 1)
                    });
                    models.push(model);
                }
                collection.add(models);
                this.loadView(PhotosView, { collection: collection });
            },
            photo: function (id) {
                var model = new Model.Photo();
                new Collection.Photos().add(model);
                if (id) {
                    model.set('id', id);
                    model.fetch();
                }
                this.loadView(PhotoFormView, { model: model });
                this.view.listenTo(this.model, 'sync', this.display);
            },
        });

        return PhotoController;
    });