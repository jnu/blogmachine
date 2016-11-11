import React, { Component } from 'react';
import { withData } from 'dreija';
import { fetchResourceList } from 'dreija/actions';
import { Link } from 'react-router';

// const ITEM_HEIGHT = 30;


@withData({
    fetch: dispatch => dispatch(fetchResourceList('posts', 'index')),
    derive: state => {
        const posts = state.posts.get('data');
        return {
            isFetchingIndex: state.root.get('isFetchingIndex'),
            posts: posts ? posts.toList().toJS() : []
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
