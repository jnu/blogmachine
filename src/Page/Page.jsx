import React, { Component } from 'react';
import { withData } from 'dreija';
import { ensureResource } from 'dreija/actions';
import Immutable from 'immutable';
import { BROWSER } from 'dreija/env';


@withData({
    fetch: (dispatch, { id }) => dispatch(ensureResource('pages', id)),
    derive: (state, props) => {
        const { id } = props.params;
        const page = state.resource.getIn(
            ['pages', '@@resources', id, '@@resources'],
            Immutable.Map()
        );
        return { page };
    }
})
class Page extends Component {

    _renderDebug() {
        return DEBUG && (
            <div className="debug">
                <pre>{ JSON.stringify(this.props.page, null, ' ') }</pre>
            </div>
        );
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { page } = this.props;

        return (
            <article className="Page">
                <header>
                    <h2><span dangerouslySetInnerHTML={{ __html: page.get('title') }}></span></h2>
                </header>
                <section className="Page-content">
                    <div dangerouslySetInnerHTML={{ __html: page.get('content') }}></div>
                </section>

                { this._renderDebug() }
            </article>
        );
    }

};

export default Page;
