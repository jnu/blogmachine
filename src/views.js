export default {
    posts: {
        map: doc => {
            if (doc.type === 'post') {
                emit('adminIndex', {
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

                // Fetch document index from view.
                if (doc.public && !doc.specialId) {
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
                    specialId: doc.specialId || ''
                });

                if (doc.specialId) {
                    emit(doc.specialId, {
                        title: doc.title || '',
                        created: doc.created || new Date(),
                        updated: doc.updated || doc.created || new Date(),
                        _id: doc._id,
                        _rev: doc._rev,
                        content: doc.content,
                        specialId: doc.specialId || '',
                        public: true
                    });
                }
            }
        }
    }
};
