requirejs.config({
    //urlArgs: "ts="+new Date().getTime(),
    shim: {
        brobone: {
            deps: ['underscore', 'jquery', 'backbone', 'handlebars'],
            exports: 'Brobone'
        },
        bootstrapdphu: {
            deps: ['bootstrapdp', 'jquery']
        }
    },
    paths: {
        jquery: 'libs/jquery-2.1.4.min',
        underscore: 'libs/underscore-min',
        backbone: 'libs/backbone',
        handlebars: 'libs/handlebars',
        brobone: 'libs/brobone',
        hbHelpers: 'app/views/base/HB_helpers',
        bootstrap: 'libs/bootstrap.min',
        bootstrapdp: 'libs/bootstrap-datepicker.min',
        bootstrapdphu: 'libs/bootstrap-datepicker.hu',
        base: 'app/views/base',
        appViews: 'app/views',
        controllers: 'app/controllers',
        data: 'app/models',
        user: 'app/views/user',
        photo: 'app/views/photo',
        currentuser: 'app/views/currentuser',
        app: 'app/app'
    },
});

requirejs(['app'],
function (App) {
    App.initialize();

});