
Brobone.Common.SortView = Brobone.ItemView.extend({
    constructor: function (args) {
        Brobone.ItemView.prototype.constructor.call(this, args);
        this.listenTo(this.collection, "sorted", this.onSort);
    },
    events: {
        'click [data-button-id="sort"]': 'buttonSort',
    },
    buttonSort: function (event) {
        if (event && event.currentTarget) {
            var property = this.$(event.currentTarget).attr('data-button-prop');
            this.sort(property);
        }
    },
    sort: function (prop) {
        this.collection.trigger("sort", { sortBy: prop, changeDirection: true });
    },
    onSort: function (sort) {
        this.$('[data-button-id="sort"]  >span').removeClass("glyphicon glyphicon-menu-down glyphicon-menu-up");
        if (sort.rev) {
            this.$('[data-button-id="sort"][data-button-prop="' + sort.sortBy + '"] ' + ' >span').toggleClass("glyphicon glyphicon-menu-up");
        }
        else {
            this.$('[data-button-id="sort"][data-button-prop="' + sort.sortBy + '"] ' + ' >span').toggleClass("glyphicon glyphicon-menu-down");
        }
    }
});