define(['jquery', 'underscore', 'brobone', 'hbHelpers'], function ($, _, Brobone) {
    var UserView = Brobone.ListItemView.extend({
        el: '[data-role="item-placeholder"]',
        template: '#temp-view-user',
        events: {
            'click': 'openform'
        },
        settings: {
            animationIn: {
                callback: $().fadeIn,
                args: ["slow"]
            },
            animationOut: {
                callback: $().fadeOut,
                args: ["slow"]
            }
        },
        openform: function (e) {
            if (e && e.currentTarget) {
                Brobone.mainRouter.navigate(this.$el.attr("data-url"), {trigger: true});
            }
            
        }
    })

    return UserView;
});