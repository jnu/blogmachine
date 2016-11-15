import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindAll } from 'lodash';
import { withData } from 'dreija';
import {
    ensureResource,
    sendResource
} from 'dreija/actions';
import {
    getResource
} from 'dreija/helpers';
import { BROWSER } from 'dreija/src/shared/env';


// TODO find an actual isomorphic text editor. All tried use some form of DOM
// query that breaks builds.
if (!BROWSER) {
    global.window = {};
    global.navigator = {};
    var ProseMirror = 'textarea';
} else {
    var ProseMirror = require('react-prosemirror').default;
    require('prosemirror/dist/inputrules/autoinput');
    require('prosemirror/dist/menu/menubar');
    require('prosemirror/dist/menu/tooltipmenu');
    require('prosemirror/dist/menu/menu');
    require('prosemirror/dist/markdown');
}



const PROSE_MIRROR_OPTS = {
    menuBar: true,
    tooltipMenu: true,
    autoInput: true,
    docFormat: 'html'
};


@withData({
    fetch: (dispatch, { id }) => dispatch(ensureResource('posts', id)),
    derive: (state, props) => ({
        post: getResource(state, 'posts', props.params.id),
        id: props.params.id
    }),
    send: (dispatch, { id, post }, data) => {
        return dispatch(sendResource('posts', { ...post.toJS(), ...data }))
            .then(() => dispatch(ensureResource('posts', id)));
    }
})
export class EditPost extends Component {
    constructor(props) {
        super(props);
        this.state = this.deriveStateFromProps(props);
        bindAll(this,
            'handleContentChange',
            'handleTitleChange',
            'handlePublicChange',
            'handleIncludesChange',
            'handleInitScriptChange',
            'handleTypeChange',
            'submit',
        );
    }

    componentWillReceiveProps(props) {
        this.setState(this.deriveStateFromProps(props));
    }

    deriveStateFromProps(props) {
        const content = props.post.get('content', '');
        const editorState = this.getInitialEditorState(content);

        return {
            title: props.post.get('title'),
            type: props.post.get('type'),
            content: editorState,
            public: props.post.get('public', false),
            includes: props.post.get('includes', '<!-- enter html includes here -->\n'),
            initScript: props.post.get('initScript', '/* enter init script here */\n'),
            submitting: false
        };
    }

    getInitialEditorState(content) {
        return content;
    }

    handleContentChange(content) {
        this.setState({ content });
    }

    handleTitleChange() {
        this.setState({ title: this.refs.title.value });
    }

    handlePublicChange() {
        this.setState({ public: this.refs.public.checked });
    }

    handleIncludesChange() {
        this.setState({ includes: this.refs.includes.value });
    }

    handleInitScriptChange() {
        this.setState({ initScript: this.refs.initScript.value });
    }

    handleTypeChange() {
        this.setState({ type: this.refs.type.value });
    }

    submit() {
        this.setState({ submitting: true }, () => {
            const { state } = this;
            this.sendData({
                    title: state.title,
                    type: state.type,
                    content: this.refs.editor.getContent('html'),
                    public: state.public,
                    updated: new Date().toISOString(),
                    includes: state.includes,
                    initScript: state.initScript
                })
                .then(() => this.setState({ submitting: false }));
        });
    }

    render() {
        const { post } = this.props;
        return (
            <div className="EditPost">
                <div>
                    <Link to="/admin">Admin Index</Link>
                </div>
                <h1>
                    <input type="text"
                           style={{ fontSize: 'inherit', border: 0, width: '100%' }}
                           value={ this.state.title }
                           name="title"
                           ref="title"
                           onChange={ this.handleTitleChange }
                           />
                </h1>
                <div>
                    <label htmlFor="type">Type:</label>
                    <input type="text"
                           name="type"
                           value={ this.state.type }
                           ref="type"
                           onChange={ this.handleTypeChange }
                           />
                </div>
                <div>
                    <label htmlFor="public">Public:</label>
                    <input type="checkbox"
                           name="public"
                           checked={ this.state.public }
                           ref="public"
                           onChange={ this.handlePublicChange }
                           />
                </div>
                <div>
                    <h3>Content:</h3>
                    <ProseMirror value={ this.state.content }
                                 onChange={ this.handleContentChange }
                                 options={ PROSE_MIRROR_OPTS }
                                 ref="editor">
                    </ProseMirror>
                </div>
                <div>
                    <label htmlFor="scripts">Includes (above):</label>
                </div>
                <div>
                    <textarea value={ this.state.includes }
                              style={{ width: '100%' }}
                              name="includes"
                              ref="includes"
                              onChange={ this.handleIncludesChange }
                              />
                </div>
                <div>
                    <label htmlFor="initScript">Init script (below):</label>
                </div>
                <div>
                    <textarea value={ this.state.initScript }
                              style={{ width: '100%' }}
                              name="initScript"
                              ref="initScript"
                              onChange={ this.handleInitScriptChange }
                              />
                </div>
                <div>
                    <button type="button"
                            onClick={ this.submit }>
                        Post
                    </button>
                </div>
                <div>
                    <h3>Original post</h3>
                    { this.props.post.get('content', '[[no content]]') }
                </div>
            </div>
        );
    }
}
