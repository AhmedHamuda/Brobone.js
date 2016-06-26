
Brobone.Common.ErrorView = Brobone.View.extend({
    constructor: function (args) {
        Brobone.View.prototype.constructor.call(this,args);
        this.prepareModel();
        this.render();
    },
    prepareModel: function () {
        this.model = new Backbone.Model();
        this.model.set('errorMsg', this.errorMesseges[this.error.validation]);
    },
    render: function () {
        this.$el.attr("data-field", $(this.error.element).attr("data-field"));
        Brobone.View.prototype.render.call(this);
    }
});