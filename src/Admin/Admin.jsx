import React, { Component } from 'react';
import { Link } from 'react-router';
import { withData } from 'dreija';
import {
    ensureResourceList
} from 'dreija/actions';
import { getResource } from 'dreija/helpers';



@withData({
    fetch: dispatch => dispatch(ensureResourceList('posts', 'adminIndex')),
    derive: state => {
        const allPosts = getResource(state, 'posts');
        const posts = allPosts.entrySeq().toList().map(([key, val]) => ({
            id: key,
            title: val.getIn(['@@resources', 'title'])
        })).toArray();
        return { posts };
    }
})
export default class Admin extends Component {

    render() {
        const { posts } = this.props;
        return (
            <div className="Admin">
                <h2>Admin</h2>
                <ul>
                    {posts.map(p => <li key={p.id}><Link to={`/edit/${p.id}`}>{p.title}</Link></li>)}
                </ul>
            </div>
        );
    }

}
