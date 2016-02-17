import 'babel-runtime/core-js';

import React from 'react';
import { render } from 'react-dom';
import { match } from 'react-router';
import { Root } from './components';
import Routes from './components/Routes';
import configureStore from './configureStore';
import Immutable from 'immutable';
import { history } from './history';
import utf8 from 'utf8';

// NB: e30= is Base-64 encoded '{}'.
export const load = (encoded = 'e30=') => {
    const data = JSON.parse(utf8.decode(atob(encoded)));
    const initialRootState = Immutable.fromJS(data.root || {});
    const initialState = Object.assign({}, data, { root: initialRootState });
    const store = configureStore(initialState);

    match({ routes: Routes, history }, (error, redirectLocation, renderProps) => {
        // XXX This is certainly wrong, but unclear what the right approach is.
        // Without forcing this location the page won't load.
        // store.getState().routing.location = initialState.routing.location;
        render(
            <Root store={ store } {...renderProps} />,
            document.getElementById('root')
        );
    });
};
