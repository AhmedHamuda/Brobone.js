//ItemView
//--------------
//
//Brobone view with rendering after initializing
Brobone.ItemView = Brobone.View.extend({
    constructor: function (args) {
        Brobone.View.prototype.constructor.call(this, args);
        this.render();
    }
});