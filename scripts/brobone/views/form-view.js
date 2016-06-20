
//Form view
//--------------------
//
Brobone.FormView = Brobone.View.extend({
    //sets the view type
    //register the main form input validation functions
    //render the form based on the model id (display mode if the model has id or edit mode if not)
    constructor: function (args) {
        Brobone.View.prototype.constructor.call(this, args);
        this.type = "FormView";
        this._registerMainValidation();
        if (this.model && this.model.id) this.display();
        else this.edit();

    },
    //selects the template based on the mode (display or edit)
    templateSelector: function (type) {
        if (_.isObject(this.template)) {
            return this.template[type];
        }
        else {
            return this.template;
        }
    },
    //render the form in display mode
    display: function () {
        var baseTemplate = _.clone(this.template);
        this.template = this.templateSelector("display");
        this.render();
        this.template = baseTemplate;
    },
    //render the form in edit mode
    //set the input field's value based on the model attributes
    //triggers the bindControl method if there is any control that has to be bind to the input field, like jquery datepickers
    edit: function () {
        var baseTemplate = _.clone(this.template);
        this.template = this.templateSelector("edit");
        this.render();
        this.template = baseTemplate;
        this.setFormData(this.model);
        this.triggerMethod("bindControls");
    },
    //bindIdToHtml: function() {
    //    var self = this;
    //    this.$("input[data-field], textarea[data-field], select[data-field], hidden[data-field]").each(function (i,e) {
    //        self.$(e).attr("data-input-id",self.model.cid + )
    //    }
    //},
    //read and validate the input field values
    // validation can be skipped if skipValidation param is true
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
    //set the input field values based on the model attriubtes.
    //can be extended with special inputs
    setFormData: function (model) {
        this.$("input:text[data-field], textarea[data-field], select[data-field], hidden[data-field]").each(function (i, e) {
            self.$(e).val(model.get(self.$(e).attr('data-field')));
        });

        this.$("input:checkbox[data-field]").each(function (i, e) {
            self.$(e).prop('checked', model.get(self.$(e).attr('data-field')));
        });
    },
    //validates the values of the input fields.
    //triggers the clear error function to clear the errors displayed on the screen
    //trigger the decorate input function for any custom input decoration vor valid and not valid states
    //return the error object 
    validateElement: function (e) {
        if (e) {
            var element = e.currentTarget;
            this.triggerMethod("clear:error", element)
            var error = this.validate(this, element);
            this.triggerMethod("decorate:input", element, error);
            error && this.triggerMethod("show:error", error);//this.showError(error);
        }
        return error;
    },
    //validate the input value
    //it's called for every input element
    //get the validations on the input form the data-validate HTML attribute as default or from custom attribute
    //which has been set in the form settings.
    //call the validation based on the "key" which is the key of registered validation.
    //return the validation key and the element. for example: {validation:"req", element: element object}
    validate: function (self, element) {
        var validationAttrs = self.$(element).attr("data-validate");
        var validators = validationAttrs && validationAttrs.split(' ');
        var value = self.$(element).val();
        if (validators) {
            for (var i = 0; i < validators.length; i++) {
                var result = this.validations[validators[i]].call(self, element, value);
                if (result) {
                    return {validation: validators[i], element: element };
                }
            }
        }
        return false;
    },
    //add the validation name and callback to the global "validations" object.
    registerValidation: function (name, callback) {
        if (typeof (name) === "string" && typeof (callback) === "function") {
            this.validations[name] = callback;
        }
        else {
            throw Error("registering validation failed, check the validation type or callback, name: " + name)
        }
    },
    //register a list of important validtions using the registerValidation function.
    _registerMainValidation: function () {
       this.validations = [];
       this.registerValidation("req", function (element, value) {
            if (!value || value == "" || value == null) {
                return true;
            }
            return false;
        });
        //get the minimum length form the "data-min-len" HTML input attribute.
        this.registerValidation("minlen", function (element, value) {
            var minLen = self.$(element).attr("data-min-len");
            if (!minLen || !$.isNumeric(minLen)) {
                throw Error("element doesnt have data-min-len attribute or the attributes is not numeric");
            }
            if (value.length < parseInt(minLen)) {
                return true;
            }
            return false;
        });
        //get the maximum length form the "data-min-len" HTML input attribute.
       this.registerValidation("maxlen", function (element, value) {
            var maxLen = self.$(element).attr("data-max-len");
            if (!self.$(maxLen) || !$.isNumeric(maxLen)) {
                throw Error("element doesnt have data-max-len attribute or the attributes is not numeric");
            }
            if (value.length > parseInt(maxLen)) {
                return true;
            }
            return false;
        });

        this.registerValidation("num", function (element, value) {
            if (!value.match(/^\d+$/)) {
                return true;
            }
        });

        this.registerValidation("date", function (element, value) {
            try {
                Date.parse(value);
                return false;
            } catch (e) {
                return true;
            }
        });

        this.registerValidation("datetoday", function (element, value) {
            try {
                var date = Date.parse(value);
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date > today) {
                    return true;
                }
                return false;
            } catch (e) {
                return true;
            }
        });
    },
    //saving model
    //validate the whole form... if valid:
    //-the model attributes get modified by the form data.
    //-if model has url then it gets sent to the server.
    //-passing wait to the function will cause waiting to the server response.
    //-triggers the save success function on successful server saving.
    //-triggers the save error function on failed server saving.
    //-add the model to the collection if the model is new
    //-triggers the save model function.
    //
    //if not triggers the invalidForm function for any further error displaying regarding the whole form.
    save: function (options) {
        options || (options = {});
        var self = this;
        var formData = this.getFormData();
        var isNew = this.model.isNew();
        if (formData) {
            this.triggerMethod("before:save:model");
            this.model.set(formData);
            if (this.model.url()) {
                this.model.save(null, {
                    wait: options.wait,
                    success: function (xhr, model) {
                        self.triggerMethod("save:success", xhr, model);
                    },
                    error: function (xhr) {
                        self.triggerMethod("save:error", xhr);
                    }
                });
            } else {
                if (isNew && this.collection && !this.model.collection) {
                    this.collection.add(this.model);
                }
            }
            this.triggerMethod("save:model");
        } else {
            this.triggerMethod("invalidForm");
        }
    },
    //if model has url then deleting request get sent to the server
    //else it will be removed from the collection.
    deleteItem: function () {
        this.triggerMethod("before:destroy:model");
        if (this.model.url()) {
            this.model.destroy();
        } else {
            this.model.collection.remove();
        }
        this.triggerMethod("destroy:model");
    },
    close: function () {
        this.destroy();
    }
});
