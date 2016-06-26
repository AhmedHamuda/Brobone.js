define(['jquery', 'handlebars', 'brobone','user/user-view'],
	function ($, Handlebars, Brobone, UserView) {
	    var EmptyView = Brobone.ItemView.extend({
	        el: '[data-role="list-placeholder"]',
	        template: "#temp-view-list-empty"
	    });

	    var UsersListView = Brobone.ListView.extend({
	        el: '[data-role="list-placeholder"]',
	        template: '#temp-view-list',
	        childView: UserView,
	        emptyView: EmptyView,
	        settings: {
	            //animationIn: {
	            //    callback: $().fadeIn,
	            //    args: ["slow"]
	            //},
	            //animationOut: {
	            //    callback: $().fadeOut,
	            //    args: ["slow"]
	            //}
	        }
	    });

	    var UsersFilterView = Brobone.Common.FilterView.extend({
	        el: '[data-role="filter-placeholder"]',
	        template: '#temp-view-filter'
	    });
    
	    var UsersSortView = Brobone.Common.SortView.extend({
	        el: '[data-role="sort-placeholder"]',
	        template: '#temp-view-sort'
	    });
     
	    var UsersPagerView = Brobone.Common.PagerView.extend({
	        el: '[data-role="pager-placeholder"]',
	        template: '#temp-view-pager'
	    });
    
	    var UsersWrapperView = Brobone.WrapperView.extend({
	        title: "Users",
	        el: '[data-role="main-placeholder"]',
	        template: '#temp-view-user-list-head',
	        templateHelpers: function(){
	            return { title: this.title }
	        },
	        childViews: [
                    UsersListView,
                    UsersFilterView,
                    UsersSortView,
                    UsersPagerView
	        ]
	    });
	    return UsersWrapperView;
});