import React, { Component } from 'react';
import { withData } from 'dreija';
import { ensureResourceList } from 'dreija/actions';
import { Link } from 'react-router';
import Immutable from 'immutable';

// const ITEM_HEIGHT = 30;


@withData({
    fetch: dispatch => dispatch(ensureResourceList('posts', 'index')),
    derive: state => {
        const allPosts = state.resource.getIn(['posts', '@@resources'], Immutable.Map());
        const posts = allPosts.entrySeq().toList().map(([key, val]) => ({
            _id: key,
            title: val.getIn(['@@resources', 'title'])
        })).toArray();
        return {
            isFetchingIndex: false, //state.root.get('isFetchingIndex'),
            posts
        };
    }
})
class Home extends Component {

    _renderPostItem(post) {
        const {  _id, title } = post;
        return (
            <div key={ _id } className="Home-index-item">
                <Link to={ `/post/${_id}` }>{ title }</Link>
            </div>
        );
    }

    _renderDebug() {
        return DEBUG && (
            <div className="debug">
                <pre>{ JSON.stringify(this.props, null, '  ') }</pre>
            </div>
        );
    }

    render() {
        const { isFetchingIndex, posts } = this.props;

        if (isFetchingIndex) {
            return (<div>Wait!</div>);
        }

        return (
            <div>
                <header>
                    <h1>Peruse</h1>
                </header>
                <div className="Home-index-container" ref="container">
                    { posts.map(this._renderPostItem) }
                </div>
                { this._renderDebug() }
            </div>
        );
    }
}

export default Home;
