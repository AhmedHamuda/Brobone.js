
Brobone.Common.PagerView = Brobone.ItemView.extend({
    constructor: function (args) {
        Brobone.ItemView.prototype.constructor.call(this, args);
        this.listenTo(this.collection, 'ready', this.render);
    },
    events: {
        'click [data-button-id="prev-page"] ': 'prevPage',
        'click [data-button-id="next-page"] ': 'nextPage'
    },
    templateHelpers: function () {
        return {
            page: this.collection.query.pager,
            disable: this.collection.query.pager.numberOfPages <= 1
        }
    },
    prevPage: function (e) {
        var pager = this.collection.query.pager;
        if (pager.current > 1) {
            pager.current--;
            this.collection.setQuery({ pager: pager });
        }
    },
    nextPage: function (e) {
        var pager = this.collection.query.pager;
        if (pager.current < pager.numberOfPages) {
            pager.current++;
            this.collection.setQuery({ pager: pager });
        }
    }
});