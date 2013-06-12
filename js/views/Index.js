define([
    'config',
    'jquery',
    'backbone',
    'views/IndexLine'
],
function(Config, $, Backbone, IndexLine) {

    var v = Backbone.View.extend({
        tagName: 'div',
        id: Config.contentEl,
        //
        initialize : function(attrs) {
            var that = this;
            _.bindAll(this, 'render');
            this.children = [];
        },
        //
        render: function() {
            var that = this,
                sortedPosts = this.collection.sortBy(function(p){
                // Sort posts by category. Since category hierarchies
                // are stored as a string delimited by '>' (e.g. "a>b>c>d")
                // an alphabetical sort will put everything in a desirable
                // order.
                return p.get('category');
            }),
                currentCategories = [],
                counters = [],
                pageCtr = 0,
                _formatter = new Blog.indexNumberFormatter(),
                _increment = function(depth) {
                    while(counters.length<=depth) {
                        // Make sure there are enough counters
                        counters.push(0);
                    }
                    for(var i=depth+1; i<counters.length; i++) {
                        // Reset counters above current one
                        counters[i] = 0;
                    }

                    // Increment and return
                    counters[depth]++;
                    return counters;
                };

            _.forEach(sortedPosts, function(currentPost, i) {
                // Iterate through sorted posts and create IndexLine views for
                // each post. Create IndexLines for category links on the way.
                var cleanCats = (currentPost.get('cleanCategories') || []),
                    cats = (currentPost.get('categories') || []),
                    collection = null,
                    j = 0,
                    path = '';

                if(currentPost.get('type')=='page') {
                    // Intercept pages: they don't get categorized
                    // and follow special layout rules
                    _increment(j);
                    var pfx = "Appendix "+ String.fromCharCode(64+(++pageCtr)),
                        newPageILV = new IndexLine({
                        properties: {
                            model: currentPost,
                            numId: ''+i+j+i,
                            fNum: _formatter(counters, j),
                            hDepth : j+3,
                            link: '/'+  (currentPost.id),
                            title: pfx + "&mdash;" + currentPost.get('title'),
                            sprite: currentPost.get('sprite')
                        }
                    });

                    that.children.push(newPageILV);

                    that.$el.append(newPageILV.render().el);

                    return;
                }

                for(j=0; j<cats.length; j++) {
                    // Make category links for any changed categories
                    if(cats[j] != currentCategories[j]) {

                        // Make path
                        path += '/' + cleanCats[j];

                        // Increment counter for categories
                        _increment(j);

                        // Add new category IndexLine
                        var newCategoryILV = new IndexLine({
                            properties: {
                                model: currentPost,
                                numId: '' + (j+1) + i,
                                fNum: _formatter(counters, j),
                                hDepth : j+3,
                                link : '/category'+ path,
                                title : cats[j],
                                sprite: ''
                            }
                        });

                        that.children.push(newCategoryILV);

                        that.$el.append(newCategoryILV.render().el);
                    }
                }
                
                currentCategories = cats;

                // Increment counter for post
                _increment(j);

                // Add a new IndexLine for the current post
                var newPostILV = new IndexLine({
                    properties: {
                        model: currentPost,
                        numId: i,
                        fNum: _formatter(counters, j),
                        hDepth : cats.length + 3,
                        link : Blog.wp.createPermalink(currentPost, 'post'),
                        date : currentPost.get('date'),
                        title : currentPost.get('title'),
                        sprite: currentPost.get('sprite')
                    }
                });

                that.children.push(newPostILV);

                that.$el.append(newPostILV.render().el);
            });
            
            return this;
        },
        //
        remove: function() {
            Backbone.View.prototype.remove.apply(this, arguments);
            _.each(this.children, function(v){ v.remove(); });
        }
    });
    
    return v;
});