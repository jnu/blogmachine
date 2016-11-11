import React, { Component } from 'react';
import { withData } from 'dreija';
import { fetchResource } from 'dreija/actions';


@withData({
    fetch: (dispatch, { id }) => dispatch(fetchResource('posts', id)),
    derive: (state, props) => {
        const posts = state.root.get('data');
        const post = posts.get(props.params.id);
        return { post };
    }
})
class Post extends Component {

    _renderDebug() {
        return DEBUG && (
            <div className="debug">
                <pre>{ JSON.stringify(this.props.post, null, ' ') }</pre>
            </div>
        );
    }

    render() {
        const { post } = this.props;

        return (
            <article className="Post">
                <header>
                    <h2>{ post.get('title') }</h2>
                </header>
                <section className="Post-content">
                    <div dangerouslySetInnerHTML={{ __html: post.get('content') }}></div>
                </section>

                { this._renderDebug() }
            </article>
        );
    }

};

export default Post;
