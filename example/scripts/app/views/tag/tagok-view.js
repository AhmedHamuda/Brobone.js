define(['jquery', 'handlebars', 'base/collection-layout-view', 'tag/tag-view', "common/filter-view", "common/sort-view","common/pager-view"], 
		function ($, Handlebars, CollectionLayoutView, TagView, FilterView, SortView, PagerView) {

    var TagokHeadView = CollectionLayoutView.extend({
        title: "Tagok",
        el: '[data-role="main-placeholder"]',
        template: Handlebars.compile($('#temp-view-tag-list-head').html())
    });
    var TagokCollectionView = Marionette.CompositeView.extend({
        el: '[data-role="list-placeholder"]',
    	constructor: function(args){
    		Marionette.CompositeView.prototype.constructor.call(this,args);
    		this.collection.url && this.collection.fetch({ reset: true, pending: true, ready: false });
    		this.listenTo(this.collection, 'ready',this.render);
    	},
    	 templateHelpers: function() {
             return { 
             	collection: this.collection,
             }
         },
         template: Handlebars.compile($('#temp-view-tag-list').html()),
         childView: TagView
         //render:function(){
         //	if (this.collection.mode.pending || !this.collection.length) {
         //		this.parent.sortView && this.parent.sortView.$el.hide();
 		 //   }
         //	else {
         //		this.parent.sortView && this.parent.sortView.$el.show();
		 //   }
         //	Marionette.CompositeView.prototype.render.call(this);
         //}
    });

    var TagokFilterView = FilterView.extend({
        el: '[data-role="filter-placeholder"]',
        template: Handlebars.compile($('#temp-view-filter').html())
    });
    
     var TagokSortView = SortView.extend({
         el: '[data-role="sort-placeholder"]',
    	 template: Handlebars.compile($('#temp-view-sort').html())
    });
     
     var TagokPagerView = PagerView.extend({
         el: '[data-role="pager-placeholder"]',
    	 template: Handlebars.compile($('#temp-view-pager').html())
     });
    
    return { 
    	TagokCollectionView: TagokCollectionView,
    	TagokHeadView: TagokHeadView,
    	TagokFilterView: TagokFilterView,
    	TagokSortView: TagokSortView,
    	TagokPagerView: TagokPagerView
    	};
});