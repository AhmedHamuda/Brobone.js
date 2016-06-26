define(['jquery',
    'underscore',
    'backbone',
    'brobone',
    'data/app-collection',
    'data/app-model',
    'photo/photos-view',
    'user/users-view'], function ($, _, Backbone, Brobone, Collection, Model, PhotosView, UsersView) {
        var StaticsController = Brobone.Controller.extend({
            loadView: function (viewClass, options) {
                this.view && this.view.destroy();
                this.view = new viewClass(options);
            },
            topPhotos: function () {
                var collection = new Collection.Photos();
                collection.setQuery({ sort: { sortBy: "votes"}, pager: { pageSize: 9, numberOfPages: 1 } });
                collection.fetch({useQuery: true});
                this.loadView(PhotosView, { collection: collection });
            },
            topUsers: function (id) {
                var collection = new Collection.Users();
                collection.setQuery({ sort: { sortBy: "votes"}, pager: { pageSize: 9, numberOfPages: 1 } });
                collection.fetch({useQuery: true });
                this.loadView(UsersView, { collection: collection });
            },
        });

        return StaticsController;
    });