import React, { Component } from 'react';
import { withData } from 'dreija';
import { ensureResource } from 'dreija/actions';
import Immutable from 'immutable';


@withData({
    fetch: (dispatch, { id }) => dispatch(ensureResource('posts', id)),
    derive: (state, props) => {
        const { id } = props.params;
        const post = state.resource.getIn(
            ['posts', '@@resources', id, '@@resources'],
            Immutable.Map()
        );
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
