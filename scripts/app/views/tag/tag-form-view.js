define(['jquery', 'underscore', 'backbone', 'marionette','handlebars', 'base/item-form-view', 'common/error-view'], function ($, _, Backbone, Marionette,Handlebars, ItemFormView, ErrorView) {

	var TagErrorView = ErrorView.extend({
    	template: Handlebars.compile($('#temp-view-error').html()),
    	errorMesseges: {
    	    req: 'kötelező mező!',
    	    num: 'csak számokat írhat be!',
    	    minlen: 'a beírt tartalom túl rövid',
    	    maxlen: 'a beírt tartalom túl hosszú'

    	}
    })
    
    var TagFormView = ItemFormView.extend({
    	title: "Új tag",
        className: 'panel panel-default',
        template: Handlebars.compile($("#temp-view-tag-form").html()),
        events: function(){
            return _.extend({}, ItemFormView.prototype.events,{
                'change select[data-field="empStatus"]': 'empStatus',
            });
        },
        bindControls: function () {
            self = this;
            this.$('[data-ctrl="datePicker"]').each(function (i, e) {
                self.$(e).datepicker({
                    language: 'hu',
                    autoclose: true
                });
            });
        },
        errorView: TagErrorView,
        errorPlaceholder: '.form-group',
        inputDecorator: function (e, error) {
            var formWrapper = this.$(e).closest(this.errorPlaceholder);
            this.$(formWrapper).removeClass("has-feedback has-success has-error");
            !error ? this.$(formWrapper).addClass("has-feedback has-success") : this.$(formWrapper).addClass("has-feedback has-error");
        },
        invalidForm: function () {
            this.$('[data-role="form-error" ]').show();
        },
        empStatus: function () {
            var orgModel = $.extend(true, {}, this.model);
            this.model.set(this.getFormData(true))
            this.editItem();
            this.model = orgModel;
            delete orgModel;
        }
    });
    
    

    return TagFormView;
});