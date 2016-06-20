Brobone.ListItemView = Brobone.View.extend({
    //clone the el to myEl.
    //empty the el (because it doesn't exist in the dom yet).
    //render the view.
    constructor: function (args) {
        this.myEl = _.clone(this.el);
        this.el = null;
        Brobone.View.prototype.constructor.call(this, args);
        this.type = "ListItemView";
        this.render();
    },
    //render the list item view.
    //append the list item to the list view.
    render: function () {
        console.log("rendering " + this.cid + " type: " + this.type);
        this.triggerMethod("before:render");
        var data = this.mixinTemplateData();
        var html = this.compileTemplate(data);
        this.triggerMethod("render");
        this.appendToList(html);
        this.animateIn();
    },
    appendToList: function (html) {
        if (this.parent) {
            this.parent.$el.append(html);
            this.setEl();
        }
    },
    //set the "el" by getting the el value from myEl which doesn't have cid property yet
    //it's important to only get the current appended element.
    //set the cid attributes to the el.
    //tell backbone about el change by calling setElement.
    setEl: function(){
      //  this.setElement();
        this.$el = this.parent.$(this.myEl).not('[cid]');
        this.$el.attr("cid", this.cid);
        this.setElement(this.$el);
    },
    //animate the shoing of the elenemt if the view settings has animateIn property.
    //animateIn can be an object which has callback and args properties,
    //---"callback" is any animation function that can be called on the element,
    //---"args" are the params which will be passed to the callback.
    //animateIn can be css3 animation passed as css class name string.
    animateIn: function(){
        var animation = this.settings.animationIn;
        if (animation && !_.isEmpty(animation)) {
            if (typeof (animation.callback) === "function") {
                this.$el.hide();
                animation.callback.apply(this.$el, animation.args);
            }
            if (typeof (animation) === "string") {
                this.$el.addClass(animation);
            }
        }
    },
    //unbindEvents the events form the view.
    // animate the view out.
    destroy: function () {
        console.log("destroying " + this.cid + " type: "+ this.type);
        this.unbindEvents();
        this.animateOut();
        this._isDestroyed = true;
        return this;
    },
    //remove the element form the DOM.
    emptyEl: function () {
        var el = this.$el || $(this);
        el.remove();
    }
});