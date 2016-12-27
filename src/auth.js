export default {
    views: {
        posts: false,
        pages: false
    },
    update: [
        {
            match: {
                field: 'type',
                value: 'post'
            },
            auth: true
        },
        {
            match: {
                field: 'type',
                value: 'page'
            },
            auth: true
        }
    ]
};
