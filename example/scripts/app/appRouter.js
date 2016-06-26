define(['jquery',
    'underscore',
    'backbone',
    'marionette',
    'data/app-collection',
    'data/app-model',
    'common/menu-view',
    'tag/tagok-view',
    'tag/tag-form-view',
    'user/profile-view',
    'user/password-view'], function ($, _, Backbone, Marionette, Collection, Model,MenuView, TagokView, TagFormView, ProfileView, PasswordView) {
        var AppRouter = Marionette.AppRouter.extend({
            initialize: function (args) {
                this.mainRegion = args.mainRegion;
                this.on('route', this.trackHistory);
                _.bindAll(this, 'loadPrev')
            },
            routes: {
                '': '',
                'tagok': 'tagokList',
                'tag(/:id)': 'tag',
                'profil': 'profile',
                'changepw': 'password',
                'felhasznalok': 'users'

            },
            trackHistory: function (name, args) {
                this.prevPage = this.currentPage;
                this.currentPage = {
                    name: name,
                    args: args,
                    hash: Backbone.history.fragment
                }
            },
            loadView: function (headView) {
                this.view = headView;
                this.mainRegion.show(this.view);
                this.view.trigger("showed");
                this.listenToOnce(this.view, 'closeView', this.loadPrev)
            },
            loadPrev: function () {
                this.navigate(this.prevPage.hash, { trigger: true });
            },
            start: function () {
                this.navigate('tagok', { trigger: true });
            },
            tagokList: function () {
                var collection = new Collection.Tagok();
                this.loadView(new TagokView.TagokHeadView({
                        collection: collection,
                        childViews: [
                            TagokView.TagokCollectionView,
                            TagokView.TagokFilterView,
                            TagokView.TagokSortView,
                            TagokView.TagokPagerView
                        ]
                    }));
            },
            tag: function (id) {
                var options = {};
                options.model = new Model.Tag();
                new Collection.Tagok().add(options.model);
                if (id) {
                    options.model.set('id', id);
                    options.fetchModel = true;
                }
                this.loadView(new TagFormView(options));
            },
            profile: function(){
            	this.loadView(new ProfileView({ model: new Model.User(), fetchModel:true }));
            },
            password: function(){
            	this.loadView(new PasswordView({ model: new Model.User() }));
            },
            users: function(){
            	 var collection = new Collection.Users();
                 this.loadView(new TagokView.TagokHeadView(
                     {
                         collection: collection,
                         collectionView: TagokView.TagokCollectionView,
                         filterView: TagokView.TagokFilterView,
                         sortView: TagokView.TagokSortView,
                         pagerView: TagokPagerView
                     }));
            }
        });
    
        var initialize = function (args) {
        	args.navRegion.show(new MenuView({ model: new Model.User() }));
            var router = new AppRouter(args);
            
            Backbone.history.start();
            router.start();
        }
    
    return { initialize: initialize }
});