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

                    // private content
                    public: doc.public
                });

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
                        author: doc.author || ''
                    });
                }
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

                    // Additional fields:
                    content: doc.content
                });
            }
        }
    }
};
