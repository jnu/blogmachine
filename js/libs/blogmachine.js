/**
 * blogmachine.js
 *
 * Copyright (c) 2013 Joe Nudell, except where otherwise noted
 */


(function(env) {

    function BlogMachine() {
        this.vars = {};
        this.cache = {};
    }

    BlogMachine.prototype = {
        Error : function(msg) {
            // ... TODO -- Error logging.
            // Should post errors to a log.
            this.msg = msg;
        },
        // Methods
        render : function(tplName, tplData) {
            if(!this.cache.templates) {
                // Designate a place in the cache for templates
                this.cache.templates = {};
            }

            if(!this.cache.templates[tplName]) {
                // Template not cached yet. Load it from the server.
                var _tpl;

                $.ajax({
                    url: this.vars.tplDir + '/' + tplName + '-tpl.html',
                    method: 'GET',
                    async: false,
                    dataType: 'html',
                    success: function(data) {
                        // Load template into underscore
                        _tpl = _.template(data);
                    }
                });

                // Save underscore template in cache
                this.cache.templates[tplName] = _tpl;
            }

            // Fill out template with given data and return
            return this.cache.templates[tplName](tplData);
        },
        //
        queryDB : function(query, force, callback) {
            // Interacts with CouchDB's RESTful API
            // Use 'force=true' to bypass cache for given request
            var that = this,
                host = this.vars.dbHost + '/' + this.vars.dbName + '/' + query;

            // Normal calling scheme is just (query, callback)
            if(typeof force==='function') callback = force;

            // Designate cache for requests to DB
            if(!this.cache.db) this.cache.db = {};

            if(!this.cache.db[query] || force===true) {
                // Execute request if not already in cache or forced refresh
                $.ajax({
                    url: host,
                    method: 'GET',
                    async: true,
                    dataType: 'json',
                    success: function(data) {
                        // First save data in cache
                        that.cache.db[query] = data;
                        // execute callback
                        if(callback) callback(data);
                    },
                });
            }else{
                // Execute callback with cached response
                // (Redundant because AJAX call is asynchronous)
                if(callback) callback(this.cache.db[query]);
            }
        },
        //
        viewDB : function(view, force, callback) {
            // Convenience function for requesting a view by name
            var query = "_design/"+ this.vars.dbDesignDoc +"/_view/"+ view;
            this.queryDB(query, force, callback);
        },
        //
        wp : {
            // WordPress-esque permalink wranglers
            createPermalink : function(post, type) {
                var link = '/';

                if(type==='post') {
                    link += post.get('date').getFullYear() + '/'
                         +  (post.get('date').getMonth()+1) + '/'
                         +  post.get('cleanTitle');
                }else if(post.type==='category') {
                    if((post.cleanCategories||[]).length) {
                        link += "category/" + post.cleanCategories.join('/') + '/';
                    }
                }

                return link;
            },
            //
            cleanPostTitle : function(title) {
                // Make title into a url-friendly string in the style used by WP
                // Todo - test function, make sure it works in all cases
                return title.toLowerCase()
                            .replace(/<.*?>/g, '')
                            .replace(/[^\w\d\s]/g, '')
                            .replace(/\s+/g, '-');
            }
        },
        //
        indexNumberFormatter : function() {
            var that = this,
                _rom = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L',
                        'XL', 'X', 'IX', 'V', 'IV', 'I'],
                _dec = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];

            this.formats = {
                abc : function(n) {
                    if(n>26 || n<1) throw new that.Error(n+" is out of format range.");
                    return String.fromCharCode(96+n);
                },

                ABC : function(n) {
                    return that.formats.abc(n).toUpperCase();
                },

                romnum : function(n) {
                    return that.formats.ROMNUM(n).toLowerCase();
                },

                ROMNUM : function(n) {
                    // Convert from decimal to roman numeral
                    if(n<1 || n>=4000) {
                        throw new that.Error(n+" is out of format range.");
                    }

                    var _r = "";

                    for(var i=0; i<_rom.length; i++) {
                        while(n>=_dec[i]) {
                            n -= _dec[i];
                            _r += _rom[i];
                        }
                    }

                    return _r;
                },

                dotSub : function(n, depth, counters) {
                    // Eg. 1.2 or 3.4. Uses previous level's counter
                    if(depth<1) throw new that.Error("Can't dot-sub first level");
                    return counters[depth-1] +"."+ n;
                }
            }

            // Define a few levels of formatting
            this.tiers = [
                that.formats.ROMNUM,
                this.formats.dotSub,
                this.formats.ABC,
                this.formats.romnum,
                this.formats.abc
            ];

            this.format = function(counters, depth) {
                return that.tiers[depth](counters[depth], depth, counters);
            }

            return this.format;
        },
        //
        interceptClicks : function() {
            // Intercept click events on links pointing to local paths and use
            // HTML5 pushState via Backbone router.
            // Call with `this` as the Backbone router
            // >> Function thanks to Gilbert Reimschüssel (http://bit.ly/16kP06e)
            var router = this;

            function _linkHandler(e, back) {

                function _interceptor(href) {
                    // Function that redirects click action to Backbone router
                    e.preventDefault();

                    // Remove shebanged URLs, though hopefully there won't be any
                    var url = href.replace(/^\//, '').replace('\#\!\/', '');

                    // Trigger Backbone routing event
                    router.navigate(url, {trigger: true});
                }

                // Determine whether interceptor should be used:
                // Set passThrough to true in cases where clicks should use default
                // behavior.

                var href = back? window.location.path
                               : $(e.currentTarget).attr('href'),
                    passThrough = false,
                    tests = [
                    /^\/\/[\w]/,    // Links omitting http / https but are external
                    /^\/static\//,  // static content on server
                    /^\/sandbox\//, // real pages on the server
                    ];
                
                for(var i=0; i<tests.length; i++) {
                    passThrough = tests[i].test(href);
                    if(passThrough) break;
                }

                if(!passThrough && !e.altKey&&!e.ctrlKey&&!e.MetaKey&&!e.shiftKey){
                    // Animation
                    $.scrollTo(0, {
                        duration: 300,
                        onAfter: function() { _interceptor(href||""); }
                    });

                    // Prevent default action
                    return false;
                }

                // Click passed through
                return true;
            }

            // Clicking on links
            $(document).on("click", "a[href^='/']", _linkHandler)

            // Back button handling
            window.addEventListener('popstate', function(e) {
                // Scroll to Top
                //e.preventDefault();
                //return _linkHandler(e, true);
                //$('#content').fadeOut('fast');
            });
        }
        //
    };

        

    // -- unfurling, pre-init step -- //

    // Install globally
    env.BlogMachine = new BlogMachine;
})(window);



