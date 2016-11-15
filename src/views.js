export default {
    posts: {
        map: doc => {
            if (doc.type === 'post') {
                emit('adminIndex', {
                    // General `index` content:
                    title: doc.title || 'Untitled',
                    type: doc.type,
                    category: doc.category || '',
                    created: doc.created || new Date(0),
                    _id: doc._id,
                    _rev: doc._rev,
                    snippet: doc.snippet || '',
                    author: doc.author || '',
                    public: doc.public || false
                });

                // Fetch document index from view.
                if (doc.public) {
                    emit('index', {
                        // General `index` content:
                        title: doc.title || 'Untitled',
                        type: doc.type,
                        category: doc.category || '',
                        created: doc.created || new Date(0),
                        _id: doc._id,
                        _rev: doc._rev,
                        snippet: doc.snippet || '',
                        author: doc.author || '',
                        public: doc.public || false
                    });
                }

                // Fetch the document itself from view.
                emit(doc._id, {
                    // Same as `index` content:
                    title: doc.title || 'Untitled',
                    type: doc.type,
                    category: doc.category || '',
                    created: doc.created || new Date(0),
                    _id: doc._id,
                    _rev: doc._rev,
                    snippet: doc.snippet || '',
                    author: doc.author || '',
                    public: doc.public || false,

                    // Additional fields:
                    content: doc.content,
                    includes: doc.includes,
                    initScript: doc.initScript
                });
            }
        }
    }
};
