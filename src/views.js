export default {
    pages: {
        map: doc => {
            // Emit document based on custom slug
            if (doc.specialId && doc.type === 'page') {
                emit(doc.specialId, {
                    title: doc.title || '',
                    created: doc.created || new Date(),
                    updated: doc.updated || doc.created || new Date(),
                    _id: doc._id,
                    _rev: doc._rev,
                    content: doc.content,
                    specialId: doc.specialId || '',
                    public: true,
                    type: doc.type,
                    snippet: doc.snippet
                });
            }
        }
    },
    admin: {
        map: doc => {
            emit('index', {
                // General `index` content:
                title: doc.title || 'Untitled',
                type: doc.type,
                category: doc.category || '',
                created: doc.created || new Date(),
                updated: doc.updated || doc.created || new Date(),
                _id: doc._id,
                _rev: doc._rev,
                snippet: doc.snippet || '',
                author: doc.author || '',
                public: doc.public || false
            });

            // Fetch the document itself from view.
            emit(doc._id, {
                // Same as `index` content:
                title: doc.title || 'Untitled',
                type: doc.type,
                category: doc.category || '',
                created: doc.created || new Date(),
                updated: doc.updated || doc.created || new Date(),
                _id: doc._id,
                _rev: doc._rev,
                snippet: doc.snippet || '',
                author: doc.author || '',
                public: doc.public || false,

                // Additional fields:
                content: doc.content,
                includes: doc.includes,
                initScript: doc.initScript,
                widgetTemplate: doc.widgetTemplate,
                specialId: doc.specialId || ''
            });

            // Emit document based on custom slug
            if (doc.specialId) {
                emit(doc.specialId, {
                    title: doc.title || '',
                    created: doc.created || new Date(),
                    updated: doc.updated || doc.created || new Date(),
                    _id: doc._id,
                    _rev: doc._rev,
                    content: doc.content,
                    specialId: doc.specialId || '',
                    public: true,
                    type: doc.type,
                    snippet: doc.snippet
                });
            }
        }
    },
    posts: {
        map: doc => {
            if (doc.type === 'post') {
                // Fetch document index from view.
                if (doc.public && !doc.specialId) {
                    var indexDoc = {
                        // General `index` content:
                        title: doc.title || 'Untitled',
                        type: doc.type,
                        category: doc.category || '',
                        created: doc.created || new Date(),
                        updated: doc.updated || doc.created || new Date(),
                        _id: doc._id,
                        _rev: doc._rev,
                        snippet: doc.snippet || '',
                        author: doc.author || '',
                        public: doc.public || false
                    };

                    emit('index', indexDoc);

                    // Emit by category
                    (doc.category || 'uncategorized').split(/[\>\|\,]/).forEach(function(tag) {
                        emit(tag, indexDoc);
                    });
                }

                // Fetch the document itself from view.
                emit(doc._id, {
                    // Same as `index` content:
                    title: doc.title || 'Untitled',
                    type: doc.type,
                    category: doc.category || '',
                    created: doc.created || new Date(),
                    updated: doc.updated || doc.created || new Date(),
                    _id: doc._id,
                    _rev: doc._rev,
                    snippet: doc.snippet || '',
                    author: doc.author || '',
                    public: doc.public || false,

                    // Additional fields:
                    content: doc.content,
                    includes: doc.includes,
                    initScript: doc.initScript,
                    widgetTemplate: doc.widgetTemplate,
                    specialId: doc.specialId || ''
                });
            }
        }
    }
};
