import React, { Component } from 'react';
import { withData } from 'dreija';
import { ensureResource } from 'dreija/actions';
import Immutable from 'immutable';
import { BROWSER } from 'dreija/env';

const noop = () => {};


class Deferred {

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

}


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

    componentDidMount() {
        const { post } = this.props;
        if (BROWSER) {
            this.injectDeps(post.get('includes'), post.get('initScript'));
        }
    }

    injectDeps(includes = '', initScript = '') {
        if (!includes && !initScript) {
            return;
        }

        // Parse text through a fragment
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createElement('div'));
        frag.firstChild.innerHTML = includes;
        const idPfx = `post_inc_${Date.now()}`;

        // Clone parsed tags - they will not be loaded if injected directly
        // into the real DOM from the fragment.
        const injected = Array.prototype.map.call(frag.firstChild.children, (node, i) => {
            const id = `${idPfx}_i`;
            let el;
            switch (node.nodeName) {
                case 'SCRIPT':
                    el = document.createElement('script');
                    el.src = node.src;
                    break;
                case 'LINK':
                    el = document.createElement('link');
                    el.href = node.href;
                    el.ref = node.ref;
                    break;
                default:
                    throw new Error(`Can't include node of type ${node.nodeName}`);
            }

            // Copy common attributes.
            el.id = node.id;
            el.type = node.type;

            // Connect to load promise.
            const def = new Deferred();
            el.onload = def.resolve;
            el.onerror = def.reject;

            return { el, id, promise: def.promise };
        });

        // Inject elements into DOM
        injected.forEach(({ el }) => document.head.appendChild(el));

        // Inject also initScript
        const initScriptId = `${idPfx}__initScript`;
        const wrappedScript = `
            ;window["${initScriptId}"] = function ${initScriptId}() {
                ${initScript};
            };`;

        const initScriptEl = document.createElement('script');
        initScriptEl.type = 'text/javascript';
        initScriptEl.id = initScriptId;
        initScriptEl.textContent = wrappedScript;

        document.body.appendChild(initScriptEl);

        // Invoke script when everything is loaded.
        Promise.all(injected.map(({ promise }) => promise))
            .then(() => {
                const fn = window[initScriptId];
                if (fn) {
                    fn();
                }
            })
            .catch(e => {
                if (DEBUG) {
                    console.error('Failed to execute init script.', e);
                }
            });

        // Track the names of things injected.
        this.setState({
            injectedElements: injected.map(({ id }) => id).concat(initScriptId),
            injectedInitFunctionName: initScriptId
        });
    }

    componentWillUnmount() {
        const {
            injectedElements,
            injectedInitFunctionName
        } = this.state;

        // Remove any injected elements
        if (injectedElements && injectedElements.length) {
            injectedElements.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.remove();
                }
            })
        }

        // Cleanup the injected init script.
        if (injectedInitFunctionName) {
            delete window[injectedInitFunctionName];
        }
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
