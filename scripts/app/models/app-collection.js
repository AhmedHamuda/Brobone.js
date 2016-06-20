define(['underscore','brobone','data/app-model'], function (_,Brobone,Models){
    var Users = Brobone.Collection.extend({
        model: Models.User,
        url: 'api/Members',
        searchProps: ["name","city"],
        defaultQuery: {
        	sort:{sortBy: "name", rev: false}
        }
    });

    var Photos = Brobone.Collection.extend({
        model: Models.Photo,
        url: 'api/Photos',
        searchProps: ["name","city"],
        defaultQuery: {
        	sort:{sortBy: "name", rev: false}
        }
    });
    return { Users: Users, Photos: Photos };
});