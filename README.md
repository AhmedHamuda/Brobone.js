# Brobone.js
Brobone framework makes development easier based on Backbone framework. It contains a number of ready to use modules which helpes the developer concentrate on the actually business needs rather than spending time on the technical bases of the application.
# Key points:
  - No Router development.
  - Main route pattern defined in the application start.
  - Controllers take place of routers.
  - More encapsulation
# Main modules
# Router
Router is a Backbone router with little weaks. instance of the router already created when you create a new instance for the application. Router needs a route pattern the default is controllerName/actionName/{optional parameter} but this can be changed to what you need.
As the application run. the registered controllers will be triggered based on the url change. So when you select an url of #users/list the router will trigger users controller and list action.

#Controller manager
Controller manager creates the connection between the controllers and the router. its job to listen to the router instraction to which controller which action needs to be triggered, then is will destroy any controller instance alive (if any) and create a new instance of the specific controller asked by the router.
Controller manager also manages the lifecycle of the controllers.

#Controller
The object that contain the actual actions to be processed. Controllers can manage the life cycle of the views. Can communicated with other controllers throwout the controller manager. but most of its job is concentrating on the application (application views/ data etc..).

#Model
Model is a Backbone Model.

#Collection
Collection is a Backbone Collection, with already built in sort filter and paging support. collection listen to different messages to do different reprezentation processing of the data. it supports static data/ dynamic data form the server but with data processing on the client side, and dynamic data from the server but with data processing on the server side (sort filter and paging on the server side).

#Views
There is number of views:
Main Views:
BaseView: Basically the base view: has the basic infrastructure for the views (rendering, destroying, animation etc..)
ItemView: BaseView that concentrate on standalone items. (more specialized one standalone items)
ListItemView: ItemView but more specialized for itemviews in the list
ListView: BaseView for views that contains a list of ItemViews ot ItemListViews
ContainerView: BaseView that contain the whole page as instance a page with filterView, SortView, ListView, ListItemView
FormView: ItemView but more specialized for Forms. capable if reading data from the form inputs, set the target model, send it directly to the server. It Has 2 modes Display for only displaying the model data and Edit for creating new model or edit an existing one. Also when editing  the FormVoew gets the data from the model and displays it in the input fields.
Supports a number of input fields: text, checkbox, datapicker, textarea..

Common Views:
FilterView: ItemView for filter purposes  
SortView: ItemView for sort purposes
PagerView: ItemView for paging purposes
