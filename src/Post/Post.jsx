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

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const { post } = this.props;
        if (BROWSER) {
            this.injectIncludes(post.get('includes'), post.get('initScript'));
        }
    }

    componentWillUnmount() {
        this.removeIncludes();
    }

    componentWillReceiveProps(nextProps) {
        // Check if path is changing
        const pathChanged = this.props.location.pathname !== nextProps.location.pathname;

        // Check that these includes are different than the ones that have
        // already been injected in the page.
        const injected = this._injected || Immutable.Map();
        const includes = injected.get('includes', '');
        const initScript = injected.get('initScript', '');

        const nextPost = nextProps.post;

        const nextInc = nextPost.get('includes');
        const needsIncUpdate = !!nextInc && includes !== nextInc;

        const nextScr = nextPost.get('initScript');
        const needsScrUpdate = !!nextScr && initScript !== nextScr;

        // Refresh includes only when content is changing
        if (BROWSER && (pathChanged || needsIncUpdate || needsScrUpdate)) {
            this.removeIncludes();
            this.injectIncludes(nextPost.get('includes'), nextPost.get('initScript'));
        }
    }

    /**
     * Inject "includes" into page. These are auxilliary scripts and styles
     * to make the posts more lively. This is obviously risky and messy. It
     * is a step towards fully fixing the legacy posts which had external
     * scripts and links embedded directly in the body of the post.
     * @param  {String} includes
     * @param  {String} initScript
     */
    injectIncludes(includes = '', initScript = '') {
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
            const id = `${idPfx}_${i}`;
            let el;

            switch (node.nodeName) {
                case 'SCRIPT':
                    el = document.createElement('script');
                    if (node.src) {
                        el.src = node.src;
                    }
                    el.textContent = node.textContent;
                    break;
                case 'LINK':
                    el = document.createElement('link');
                    el.href = node.href;
                    el.rel = node.rel;
                    break;
                default:
                    throw new Error(`Can't include node of type ${node.nodeName}`);
            }

            // Copy common attributes.
            el.id = id;
            if (node.type) {
                el.type = node.type;
            }

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
        this._injected = Immutable.fromJS({
            injectedElements: injected.map(({ id }) => id).concat(initScriptId),
            injectedInitFunctionName: initScriptId,
            includes,
            initScript
        });
    }

    /**
     * Remove injected content (scripts and styles). This should be called
     * when the component will update with new content, or is being unmounted.
     *
     * TODO This doesn't attempt to clean up any modifications made by the
     * injected script itself. Could try harder to sandbox injected content
     * to make this possible, or informally add some events that notify the
     * script that it needs to clean up.
     */
    removeIncludes() {
        const injected = this._injected || Immutable.Map();

        const injectedElements = injected.get('injectedElements', Immutable.List()).toArray();
        const injectedInitFunctionName = injected.get('injectedInitFunctionName')
        const includes = injected.get('includes', '');
        const initScript = injected.get('initScript', '');

        // Remove any injected elements
        if (injectedElements.length) {
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

        const content = (post.get('content') || '')
            .replace(/<jn\-widget>\s*<\/jn\-widget>/, post.get('widgetTemplate'));

        return (
            <article className="Post">
                <header>
                    <h2><span dangerouslySetInnerHTML={{ __html: post.get('title') }}></span></h2>
                </header>
                <section className="Post-content">
                    <div dangerouslySetInnerHTML={{ __html: content }}></div>
                </section>

                { this._renderDebug() }
            </article>
        );
    }

};

export default Post;
