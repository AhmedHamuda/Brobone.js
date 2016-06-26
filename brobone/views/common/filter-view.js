
Brobone.Common.FilterView = Brobone.ItemView.extend({
    constructor: function (args) {
        Brobone.ItemView.prototype.constructor.call(this, args);
        this.listenTo(this.collection, "filtered", this.onFilter);
    },
    events: {
        'click button[data-button-id="filter"]': 'buttonFilter',
        'keyup input[data-input-id="search-input"]': 'liveInput'
    },
    buttonFilter: function (event) {
        if (event && event.currentTarget) {
            var property = this.$(event.currentTarget).attr('data-button-prop');
            var value = this.$(event.currentTarget).attr('data-button-value');
            this.filterProp(property, value);
            this.$('button[data-button-id="filter"][data-button-prop="' + property + '"]').removeClass("active");
            this.$(event.currentTarget).addClass("active");
        }
    },
    liveInput: function (event) {
        if (event && event.currentTarget) {
            var text = $(event.currentTarget).val();
            this.liveSearch(text);
        }
    },
    filterProp: function (prop, value) {
        if (value == "true" || value == "false") {
            value = value === "true" ? true : false;
        }
        if (_.isNumber(value)) {
            value = parseInt(value);
        }

        this.collection.trigger("filter", "prop", { prop: prop, value: value }); // setQuery({filter: filter});
    },
    liveSearch: function (text) {
        this.collection.trigger("filter", "text", { text: text });
    },
    onFilter: function (filter) {

    }
});