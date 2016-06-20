Brobone.CompiledTemplates = Brobone.CompiledTemplates || {};
Brobone.templateCache = {
    get : function (id) {
        return Brobone.CompiledTemplates[id];
    },
    set :function (id, compiler) {
        if ($(id).length == 0) {
            throw "template doesn't exist or not reachable. id: "+ id;
        }
        switch (compiler.toLowerCase()) {
            case "handlebars":
                Brobone.CompiledTemplates[id] = Handlebars.compile($(id).html());
                break;
            default:
                Brobone.CompiledTemplates[id] = _.template($(id).html());
                break;
        }
    },
    getCached : function (id, compiler) {
        if (!Brobone.CompiledTemplates[id]) {
            this.set(id, compiler)
        }
        return this.get(id);
    }
};