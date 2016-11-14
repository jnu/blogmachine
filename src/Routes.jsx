import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './App';
import Home from './Home';
import Post from './Post';
import Admin, { EditPost } from './Admin';
import Login from './Login';


export default ({ withAuth }) => (
    <Route path="/" component={ App }>
        <IndexRoute component={ Home } />
        <Route path="post/:id" component={ Post } />
        <Route path="login" component={ Login } />
        <Route path="admin" component={ Admin } onEnter={ withAuth() } />
        <Route path="edit/:id" component={ EditPost } onEnter={ withAuth() } />
    </Route>
);
