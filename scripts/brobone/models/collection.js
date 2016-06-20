/* Brobone collection*/
Brobone.Collection = Backbone.Collection.extend({
    /**/
    constructor: function (args) {
        Backbone.Collection.prototype.constructor.call(this, args);
        this.setDefaultQuery();
        this.initMode();
        this.on('reset', this.prepare);
        this.on('update', this.prepare);
        this.on('add', this.prepare);
        this.on('filter', this.beforeFilter);
        this.on('sort', this.beforeSort);
        this.on('page', this.beforePaging);
    },
    clientProcess: true,
    fetch: function (options) {
        options || (options = {});
        var data = options.data || {};
        if (options.useQuery === true) {
            data = _.extend(data, this.query);
        }
        //data = JSON.stringify(data);
        this.setMode({ pending: true, ready: false });
        return Backbone.Collection.prototype.fetch.call(this, { data: $.param(data), reset: true });
    },
    initMode: function () {
        if (this.url) {
            this.mode = { pending: true, ready: false }
        }
        else {
            this.mode = { pending: false, ready: true }
        }
       
    },
    setMode: function (options) {
        this.mode = {
            pending: options.pending,
            ready: options.ready
        }
    },
    setDefaultQuery: function () {
        var query = this.defaultQuery || {};
        this.query = {
            filter: query.filter || { properties: [], freeText: null },
            sort: query.sort || { rev: false, sortBy: "" },
            pager: query.pager || { pageSize: 10, numberOfPages: 0, current: 1 }
        }
    },
    setQuery: function (query) {
        query || (query = {});
        this.query = {
            filter: query.filter || this.query.filter,
            sort: query.sort || this.query.sort,
            pager: query.pager || this.query.pager
        };
        if (this.clientProcess) {
            this.process();
        }
    },
    prepare: function () {
        this.setMode({ pending: false, ready: true });
        this.allModel = this.models;
        this.setQuery();
    },
    process: function () {
        var query = this.query;
        var collection = this.allModel || this.models;
        if (collection && query) {
            collection = this.filter(collection, query.filter);
            collection = this.sort(collection, query.sort);
            collection = this.pagination(collection, query.pager);
        }
        this.models = collection;
        this.length = collection.length;
        this.trigger("ready");
        return this;
    },
    beforeFilter: function (type, filterObj) {
        if (filterObj && type) {
            var filter = this.query.filter;
            switch (type) {
                case "prop":
                    if (!filter.properties) filter.properties = [];
                    filter.properties = _.filter(filter.properties, function (prop) {
                        return prop.name != filterObj.name;
                    });
                    filter.properties.push(filterObj);
                    break;
                case "text":
                    filter.freeText = filterObj.text;
                    break;
            }
            this.setQuery({ filter: filter });
        }
    },
    filter: function (collection, filter) {
        if (filter && filter.properties) {
            filter.properties = _.filter(filter.properties, function (prop) {
                return prop.value !== "" && prop.value !== null;
            });
            var filtersObj = _.object(_.map(filter.properties, _.values));
            collection = (new Backbone.Collection(collection)).where(filtersObj);
        };

        if (filter && filter.freeText) {
            var self = this;
            var text = filter.freeText;
            var result = [];
            _.each(self.searchProps, function (prop) {
                result.push.apply(result, _.filter(collection, function (model) {
                    return model.attributes[prop].toLowerCase().indexOf(text.toLowerCase()) > -1;
                }));
            });
            result = _.uniq(result, function (item, index) {
                return item.id;
            })
            collection = result;
            this.trigger("filtered", filter);
        }
        return collection;
    },
    beforeSort: function (sortObj) {
        if (sortObj) {
            var sort = {
                sortBy: sortObj.sortBy,
                rev: sortObj.changeDirection ? !this.query.sort.rev : this.query.sort.rev,
                special: sortObj.special
            }
            this.setQuery({ sort: sort });
        }
    },
    sort: function (collection, sort) {
        if (sort) {
            if (sort.sortBy) {
                collection = _.sortBy(collection, function (model) {
                    return model.attributes[sort.sortBy];
                });
            }
            if (sort.rev) {
                collection = collection.reverse();
            }
            this.trigger("sorted", sort);
        }

        return collection;
    },
    pagination: function (collection, pager) {
        var lastNumberOfPages = this.query.pager.numberOfPages;
        this.query.pager.numberOfPages = collection.length > pager.pageSize ? Math.round(collection.length / pager.pageSize) : 1;
        if (lastNumberOfPages != this.query.pager.numberOfPages) {
            this.query.pager.current = 1;
        }
        collection = _.rest(collection, pager.pageSize * (pager.current - 1));
        collection = _.first(collection, pager.pageSize);
        this.trigger("paged", pager);
        return collection;
    },
    addWithoutTrigger: function (models, options) {
        options || (options = {});
        options.silent = true;
        Backbone.Collection.prototype.add.call(this, models, options);
    }
});