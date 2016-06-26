define(['jquery', 'underscore', 'brobone', 'handlebars', 'bootstrap', 'bootstrapdp', 'bootstrapdphu'], function ($, _, Brobone, Handlebars) {

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
    	    display: "#temp-view-tag-form-display",
    	    edit: "#temp-view-tag-form-edit"
    	},
    	events: {
    	    'change [data-validate]': 'validateElement',
    	    'click [data-button-id="save-item"]': 'save',
    	    'click [data-button-id="delete-item"]': 'deleteItem',
    	    'click [data-button-id="edit-item"]': 'edit',
    	    'click [data-button-id="close-item"]': 'close',
            'change select[data-field="empStatus"]': 'empStatus'
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
        },
        empStatus: function () {
            var orgModel = $.extend(true, {}, this.model);
            this.model.set(this.getFormData(true));
            this.editItem();
            this.model = orgModel;
        }
    });
    
    

    return UserFormView;
});