export default {
    posts: {
        map: doc => {
            if (doc.type === 'post') {
                const post = {
                    title: doc.title || 'Untitled',
                    type: doc.type;
                    category: doc.category || '',
                    created: doc.created || new Date(0),
                    whichiwrote: doc.whichiwrote,
                    _id: doc._id,
                    _rev: doc._rev,
                    sprite: doc.sprite || '0 0',
                    oldUrl: doc.oldUrl,
                    snippet: doc.snippet || '',
                    author:doc.author || '',
                    image: doc.image || null,
                    callback: doc.callback || null
                };
                emit('index', post);
                post.content = doc.content;
                emit(doc._id, post);
            }
        }
    }
};
