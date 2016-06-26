define(['jquery', 'underscore', 'backbone', 'marionette','handlebars','hbHelpers'], function ($, _, Backbone, Marionette,Handlebars) {
    var TagView = Marionette.ItemView.extend({
        tagName: 'tr',
        className: 'selectable-item',
        template: Handlebars.compile($('#temp-view-tag').html())
    })

    return TagView;
});