Brobone.Model = Backbone.Model.extend({
    constructor: function (args) {
        Backbone.Collection.prototype.constructor.call(this, args);
        this.initMode();
    },
    initMode: function () {
        this.mode = {
            pending: this.url() ? true : false,
            ready: this.url() ? false : true
        }
    },
    setMode: function (options) {
        this.mode = {
            pending: options.pending,
            ready: options.ready
        }
    },
    fetch: function (options) {
        this.setMode({ pending: true, ready: false });
        return Backbone.Model.prototype.fetch.call(this, options);
    }
});