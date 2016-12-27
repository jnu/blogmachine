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
            title: val.getIn(['@@resources', 'title']),
            public: val.getIn(['@@resources', 'public']),
            snippet: val.getIn(['@@resources', 'snippet'])
        })).toArray();
        return { posts };
    }
})
export default class Admin extends Component {

    render() {
        const { posts } = this.props;
        return (
            <div className="Admin">
                <nav style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li>
                            <Link to="/edit/"
                                  className="CircleButton CircleButton-Big ButtonRed"
                                  onClick={ this.submit }>
                                <span className="CircleButton-Text">+</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
                <h2>Admin</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {posts.map(p => {
                        const symbol = p.public ?
                            // Check mark
                            String.fromCharCode(0x2713) :
                            '';
                        return (
                            <li key={p.id}
                                style={{ marginBottom: '1rem' }}>
                                <div>
                                    <span className="PostIndex-public"
                                          style={{
                                                display: 'inline-block',
                                                width: '2rem'
                                            }}>
                                            {symbol}
                                    </span>
                                    <Link to={`/edit/${p.id}`}>{p.title}</Link>
                                </div>
                                <div style={{
                                        marginLeft: '2rem',
                                        paddingLeft: '0.5rem',
                                        paddingRight: '0.5rem',
                                        fontSize: '0.75rem'
                                    }}
                                     dangerouslySetInnerHTML={{ __html: p.snippet }}>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        );
    }

}
