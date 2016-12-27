import React, { Component } from 'react';
import { withData } from 'dreija';
import { ensureResourceList } from 'dreija/actions';
import { Link } from 'react-router';
import Immutable from 'immutable';
import {
    isFetching
} from 'dreija/helpers';
import { lightGray } from '../common/Palette';
import { humanSlugForResource } from '../util/slug';



@withData({
    fetch: (dispatch, { id }) => dispatch(ensureResourceList('posts', id || 'index')),
    derive: (state, props) => {
        const categoryId = props.params.id;
        const allPosts = state.resource.getIn(['posts', '@@resources'], Immutable.Map());
        const unfilteredPosts = allPosts
            .entrySeq()
            .toList()
            .map(([key, val]) => ({
                _id: key,
                title: val.getIn(['@@resources', 'title']),
                snippet: val.getIn(['@@resources', 'snippet']),
                created: val.getIn(['@@resources', 'created']),
                tags: (val.getIn(['@@resources', 'category']) || '').split(/[\|\>\,]/).map(tag => tag.trim())
            }))
            .toArray();
        const posts = !categoryId ?
            unfilteredPosts.slice() :
            unfilteredPosts.filter(post => post.tags.indexOf(categoryId) >= 0)
        return {
            category: categoryId,
            isFetchingIndex: isFetching(state),
            posts
        };
    }
})
class Home extends Component {

    _renderPostItem(post) {
        const {  _id, title, snippet, tags, created } = post;
        return (
            <div key={ _id } className="Home-index-item">
                <div>
                    <Link to={ `/post/${humanSlugForResource(_id, title)}` }>
                        <span dangerouslySetInnerHTML={{ __html: title }}></span>
                    </Link>
                    <span style={{
                        float: 'right',
                        fontSize: '0.75rem',
                        paddingTop: '0.375rem',
                        color: lightGray
                    }}>
                        { new Date(created).toISOString().substr(0, 10) }
                    </span>
                </div>
                <div style={{
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        fontSize: '0.75rem',
                        marginBottom: '2rem'
                    }}>
                    <span dangerouslySetInnerHTML={{ __html: snippet }}></span>
                    <span style={{ float: 'right' }}>
                        {tags.map(tag => (
                            <Link className="Tag" to={`/category/${tag}`} key={tag}>{tag}</Link>
                        ))}
                    </span>
                </div>
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

        const categoryId = this.props.category || '';

        return (
            <div>
                <header>
                    <h1>Projects{ categoryId ? `: ${categoryId}` : ''}</h1>
                </header>
                <div className="Home-index-container" ref="container">
                    { posts.sort((a, b) => a.created < b.created ? 1 : -1).map(this._renderPostItem) }
                </div>
                { this._renderDebug() }
            </div>
        );
    }
}

export default Home;
