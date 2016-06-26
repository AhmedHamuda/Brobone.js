define(['jquery', 'underscore', 'backbone', 'marionette', 'handlebars', 'base/form-validator', 'bootstrap', 'bootstrapdphu'],
		function ($, _, Backbone, Marionette, Handlebars, FormValidator) {

    var ItemFormView = Marionette.ItemView.extend({
        constructor: function (args) {
        	this.mode = { loading: false, disp: true, edit: false }
        	Marionette.ItemView.prototype.constructor.call(this,args);
        	this.errorViews = [];
    		if (this.model && this.options.fetchModel) {
    			this.mode = { loading: true, disp: false, edit: false }
    			this.options.fetchProps ? this.model.fetch(this.options.fetchProps) : this.model.fetch();
        		this.listenTo(this.model,'sync',this.display)
    		}
    		this.model.isNew() && this.listenTo(this, "showed", this.editItem);
        	
        },
        templateHelpers: function() {
        	return {
	            title: this.title,
	            mode: this.mode,
	            model: this.model
        	}
        },
        events: {
        	'change [data-validate]': 'validateElement',
            'click [data-button-id="save-item"]': 'saveItem',
            'click [data-button-id="delete-item"]': 'deleteItem',
            'click [data-button-id="edit-item"]': 'editItem'
        },
        display: function(){
        	this.mode = { disp: true, edit: false };
        	this.render();
        },
        getFormData: function (skipValidation) {
            var formData = {};
            invalidform = false;
            this.$("input:text[data-field], textarea[data-field], select[data-field], hidden[data-field]").each(function (i, e) {
                if (!self.validateElement(e) || skipValidation) {
                    formData[$(e).attr("data-field")] = $(e).val() || null;
                } else {
                    invalidform = true;
                }
            });

            this.$("select[data-field]").each(function (i, e) {
                if (!self.validateElement(e) || skipValidation) {
                    formData[$(e).attr("data-field")] = $(e).val() == "true" ? true : $(e).val() == "false" ? false : $(e).val() || null;
                } else {
                    invalidform = true;
                }
            });

            this.$("input:text[data-field][data-ctrl='datePicker']").each(function (i, e) {
                if (!self.validateElement(e) || skipValidation) {
                    try {
                        formData[$(e).attr("data-field")] = $(e).val() ? new Date($(e).val()) : null;
                    } catch (e) {
                        formData[$(e).attr("data-field")] = null;
                    }
                } else {
                    invalidform = true;
                }
            });

            this.$("input:checkbox[data-field]").each(function (i, e) {
                if (!self.validateElement(e) || skipValidation) {
                    formData[$(e).attr("data-field")] = $(e).prop('checked');
                } else {
                    invalidform = true;
                }
            });

            formData = invalidform == true ? null : formData;
            return formData;
        },
        setFormData: function (model) {
            this.$("input:text[data-field], textarea[data-field], select[data-field], hidden[data-field]").each(function (i, e) {
            		 self.$(e).val(model.get(self.$(e).attr('data-field')));
            });

            this.$("input:checkbox[data-field]").each(function (i, e) {
                self.$(e).prop('checked', model.get(self.$(e).attr('data-field')));
            });
        },
        validateElement: function (e) {
        	if (e) {
        		this.destroyError(e);
        		var error = FormValidator.validate(this, e);
        		typeof(this.inputDecorator) === "function" && this.inputDecorator(e, error);
            	error && this.showError(error);
			}
        	return error;
        },
        showError: function(error) {
        	if (!this.errorView) {
        		throw "error view is missing"
			}
        	var errorView = new this.errorView({error: error });
        	this.$(error.element).closest(this.errorPlaceholder).append(errorView.el);
        	this.errorViews.push(errorView);
        	
        },
        destroyError: function(element){
        	var elementErrorViews = _.filter(this.errorViews, function(view){
        		return view.element == element;
        	});
        	_.each(elementErrorViews, function(view){
        		view.remove();
        	})
        },
        invalidForm: function() {},
        bindControls: function () {},
        editItem: function () {
			this.mode = {
				disp: false,
                edit: true	
			}
            this.render();
            this.setFormData(this.model);
            this.bindControls();
        },
        saveItem: function () {
            var self = this;
            var formData = this.getFormData();
            if (formData) {
                this.model.set(formData);
                this.model.save(null, {
                    wait: true,
                    success: function (xhr, model) {
                        self.saveSuccess(xhr, model);
                    },
                    error: function (xhr) {
                        self.saveError(xhr);
                    }
                });
            } else {
                this.invalidForm();
            }
        },
        saveSuccess: function (xhr, model) {
            this.trigger("closeView");
        },
        saveError: function (xhr) {

        },
        deleteItem: function () {

        },
    })

    return ItemFormView;
});