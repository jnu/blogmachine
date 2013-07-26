define([
    'jquery',
    'underscore',
    'backbone',
    'blogmachine',
    'config',
    'views/BlogView',
    'collections/Pages'
],
function($, _, Backbone, BlogMachine, Config, BlogView, Pages) {

    if(BlogMachine.init===undefined) {
        BlogMachine.init = function() {
            // Closure to create initial views and start router, etc.
            // Create master blog view
            $.extend(true, this.vars, Config);

            var that = this;

            this.queryDB(Config.spriteMap, function(metaData) {
                // Just save meta in cache
                that.cache.spriteMap = metaData;

                that.blogview = new BlogView;

                // Make collection for posts and fetch index of them
                // from the server.
                that.pages = new Pages;
                that.pages.fetch();
            });

            return this;
        };

        BlogMachine.init.bind(BlogMachine);
    }

    return BlogMachine;
});