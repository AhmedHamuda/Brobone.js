define(['jquery', 'handlebars', 'brobone', 'photo/photo-view'],
	function ($, Handlebars, Brobone, ItemView) {
	    var EmptyView = Brobone.ItemView.extend({
	        el: '[data-role="list-placeholder"]',
	        template: "#temp-view-list-empty"
	    });

	    var ListView = Brobone.ListView.extend({
	        el: '[data-role="list-placeholder"]',
	        template: '#temp-view-list',
	        childView: ItemView,
	        emptyView: EmptyView
	    });

	    var FilterView = Brobone.Common.FilterView.extend({
	        el: '[data-role="filter-placeholder"]',
	        template: '#temp-view-filter'
	    });
    
	    var SortView = Brobone.Common.SortView.extend({
	        el: '[data-role="sort-placeholder"]',
	        template: '#temp-view-sort'
	    });
     
	    var PagerView = Brobone.Common.PagerView.extend({
	        el: '[data-role="pager-placeholder"]',
	        template: '#temp-view-pager'
	    });
    
	    var WrapperView = Brobone.WrapperView.extend({
	        title: "Photos",
	        templateHelpers: function () {
	            return { title: this.title }
	        },
	        el: '[data-role="main-placeholder"]',
	        template: '#temp-view-photo-list-head',
	        childViews: [
                    ListView,
                    FilterView,
                    SortView,
                    PagerView
	        ]
	    });
	    return WrapperView;
});