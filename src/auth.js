export default {
    views: {
        posts: false
    },
    update: [
        {
            match: {
                field: 'type',
                value: 'post'
            },
            auth: true
        }
    ]
};
