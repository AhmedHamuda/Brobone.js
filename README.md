# Brobone.js
Brobone framework makes development easier based on Backbone framework. It contains a number of ready to use modules which helpes the developer concentrate on the actually business needs rather than spending time on the technical bases of the application.
### Key points:
  - No Router development.
  - Main route pattern defined in the application start.
  - Controllers take place of routers.
  - More encapsulation.


### Application
Application is an object that allows you to register the controller to the routing and also to make it managable by the controller manager. you can set the starting route at the start of you application. also you can set the options to Backbone history. 
```javascript
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
    
     var initialize = function () {
        app.start({ startRoute: "users/userlist" });
    }
```
You can register some actions by adding them as a callback before the start of the application
```javascript
    app.on("start", function () {
        new MenuView({
            keepAlive: true,
            model: new Model.CurrentUser()
        });
    })
```
### Router
Router is a Backbone router with little weaks. instance of the router already created when you create a new instance for the application. Router needs a route pattern the default is controllerName/actionName/{optional parameter} but this can be changed to what you need, the only restriction is that you need a controller name and an action name, and the action name  hash to match the function name corresponding to it.

As the application run. the registered controllers will be triggered based on the url change. So when you select an url of #users/list the router will trigger users controller and list action.

### Controller manager
Controller manager creates the connection between the controllers and the router. its job to listen to the router instraction to which controller which action needs to be triggered, then is will destroy any controller instance alive (if any) and create a new instance of the specific controller asked by the router.
Controller manager also manages the lifecycle of the controllers.

### Controller
The object that contain the actual actions to be processed. Controllers can manage the life cycle of the views. Can communicated with other controllers throwout the controller manager. but most of its job is concentrating on the application (application views/ data etc..).
```javascript
 var UserController = Brobone.Controller.extend({
            loadView: function (viewClass, options) {
                this.view && this.view.destroy();
                this.view = new viewClass(options);
            },
            userList: function () {
                var collection = new Collection.Users();
                collection.setQuery({ pager: { pageSize: 9 } });
                 .....
                }
                this.loadView(UsersView, { collection: collection });
            },
        });
```
this controller will response to the users/userList url
### Model
Model is a Backbone Model.

### Collection
Collection is a Backbone Collection, with already built in sort filter and paging support. collection listen to different messages to do different reprezentation processing of the data. it supports static data/ dynamic data form the server but with data processing on the client side, and dynamic data from the server but with data processing on the server side (sort filter and paging on the server side).
Everything works by setting the query which basically consisting of:
- filter
- sort
- pager
```javascript
  var Users = Brobone.Collection.extend({
        model: Models.User,
        url: 'api/Members',
        searchProps: ["name","city"],
        defaultQuery: {
        	sort:{sortBy: "name", rev: false}
        }
    });
```
you can set a default query or:
```javascript
  var collection = new Collection.Users();
  collection.setQuery({ pager: { pageSize: 9 } });
```
set it in the controller action
### Views
There is number of views:
Main Views:
- BaseView: Basically the base view: has the basic infrastructure for the views (rendering, destroying, animation etc..)
- ItemView: BaseView that concentrate on standalone items. (more specialized one standalone items)
- ListItemView: ItemView but more specialized for itemviews in the list
- ListView: BaseView for views that contains a list of ItemViews ot ItemListViews
- WrapperView: BaseView that contain the whole page as instance a page with filterView, SortView, ListView, ListItemView
- FormView: ItemView but more specialized for Forms. capable if reading data from the form inputs, set the target model, send it directly to the server. It Has 2 modes Display for only displaying the model data and Edit for creating new model or edit an existing one. Also when editing  the FormVoew gets the data from the model and displays it in the input fields.
Supports a number of input fields: text, checkbox, datapicker, textarea.. and also validates the form.

Common Views:
- FilterView: ItemView for filter purposes  
- SortView: ItemView for sort purposes
-PagerView: ItemView for paging purposes

The main template engine is handlebars, but it supports underscore template engine also.
this is an example of a full list view: 
```javascript
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
```
It consists of number of small views which is all wrapped in the wrapper view. the life cycle of the views are dealt by themselves. The only thing is that the parent triggers the childs to destory themselves for example before the parent destroy itself. So there is a hierarchy in the exectution.

example of formview:
```javascript
var UserErrorView = Brobone.Common.ErrorView.extend({
        el: '[data-role="error-placeholder"]',
    	template: '#temp-view-error',
    	errorMesseges: {
    	    req: 'kötelező mező!',
    	    num: 'csak számokat írhat be!',
    	    minlen: 'a beírt tartalom túl rövid',
    	    maxlen: 'a beírt tartalom túl hosszú'

    	}
    })
    
    var UserFormView = Brobone.FormView.extend({
        constructor: function(args){
            Brobone.FormView.prototype.constructor.call(this, args);
            this.listenTo(this.model, 'sync', this.display);
        },
    	title: "Új tag",
    	el: '[data-role="main-placeholder"]',
    	template: { 
    	    display: "#temp-view-user-form-display",
    	    edit: "#temp-view-user-form-edit"
    	},
    	events: {
    	    'change [data-validate]': 'validateElement',
    	    'click [data-button-id="save-item"]': 'save',
    	    'click [data-button-id="delete-item"]': 'deleteItem',
    	    'click [data-button-id="edit-item"]': 'edit',
    	    'click [data-button-id="close-item"]': 'close'
    	},
        onBindControls: function () {
            self = this;
            this.$('[data-ctrl="datePicker"]').each(function (i, e) {
                self.$(e).datepicker({
                    language: 'hu',
                    autoclose: true
                });
            });
        },
        onDecorateInput: function (element, error) {
            var formWrapper = this.$(element).closest(".form-group");
            this.$(formWrapper).removeClass("has-feedback has-success has-error");
            !error ? this.$(formWrapper).addClass("has-feedback has-success") : this.$(formWrapper).addClass("has-feedback has-error");
        },
        onShowError: function (error) {
            if (!this.errorView) {
                throw "error view is missing"
            }
            var errorView = new UserErrorView({ error: error });
            this.errorViews.push(errorView);
        },
        onClearError: function (element) {
            var elementErrorViews = _.filter(this.errorViews, function (view) {
                return view.element == element;
            });
            _.each(elementErrorViews, function (view) {
                view.destroy();
            })
        },
        onInvalidForm: function () {
            this.$('[data-role="form-error" ]').show();
        }
    });
  ```
  For a wholr working example please take a look at the example folder
