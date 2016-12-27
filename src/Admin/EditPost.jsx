import React, { Component } from 'react';
import Immutable from 'immutable';
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
import { realLightGray } from '../common/Palette';
import './EditPost.less';


// TODO find an actual isomorphic text editor. All tried use some form of DOM
// query that breaks builds.
if (!BROWSER) {
    global.window = {};
    global.navigator = {};
    var ProseMirror = 'textarea';
} else {
    // Configure ProseMirror. TODO move this into module.
    var ProseMirror = require('react-prosemirror').default;
    require('prosemirror/dist/inputrules/autoinput');
    require('prosemirror/dist/menu/menubar');
    require('prosemirror/dist/menu/tooltipmenu');
    require('prosemirror/dist/menu/menu');
    require('prosemirror/dist/markdown');
    var defaultSchema = require('prosemirror/dist/model/defaultschema').defaultSchema;
    var schema = require('prosemirror/dist/model/schema');

    // Construct Widget rich text element.
    // TODO Widget is super naive, add support for multiple elements.
    class Widget extends schema.Inline {
        get attrs() {
            return {};
        }
        get draggable() {
            return true;
        }
        serializeDOM(node, s) {
            return s.elt('jn-widget', {});
        }
    }

    // Register widget DOM parser
    Widget.register('parseDOM', 'jn-widget', {
        parse(dom, state) {
            state.insert(this, {});
        }
    });

    // Register element insert handler
    Widget.register('command', 'insert', {
        derive: {
            params: [
            ]
        },
        label: 'Insert widget',
        menu: {
            group: 'insert',
            rank: 20,
            display: { type: 'label', label: 'Widget' }
        }
    });

    // Construct custom schema based on default with additional Widget
    var customSchema = new schema.Schema({
        nodes: defaultSchema.nodeSpec.addToEnd('widget', {
            type: Widget,
            group: 'inline'
        }),
        marks: defaultSchema.markSpec
    });
}



const PROSE_MIRROR_OPTS = {
    menuBar: true,
    tooltipMenu: true,
    autoInput: true,
    docFormat: 'html',
    schema: customSchema
};


@withData({
    fetch: (dispatch, { id }) => dispatch(ensureResource('admin', id)),
    derive: (state, props) => ({
        post: getResource(state, 'admin', props.params.id) || Immutable.Map(),
        id: props.params.id
    }),
    send: (dispatch, { id, post }, data) => {
        return dispatch(sendResource('admin', { ...post.toJS(), ...data }))
            .then(() => dispatch(ensureResource('admin', id)));
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
            'handleWidgetTemplateChange',
            'handleTypeChange',
            'handleCategoryChange',
            'handleSpecialIdChange',
            'handleSnippetChange',
            'handleOrigViewRenderedChange',
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
            snippet: props.post.get('snippet'),
            category: props.post.get('category'),
            specialId: props.post.get('specialId'),
            public: props.post.get('public', false),
            includes: props.post.get('includes', '<!-- enter html includes here -->\n'),
            initScript: props.post.get('initScript', '/* enter init script here */\n'),
            widgetTemplate: props.post.get('widgetTemplate', '<!-- enter widget template here -->\n'),
            submitting: false,
            origViewRendered: false
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

    handleWidgetTemplateChange() {
        this.setState({ widgetTemplate: this.refs.widgetTemplate.value });
    }

    handleTypeChange() {
        this.setState({ type: this.refs.type.value });
    }

    handleCategoryChange() {
        this.setState({ category: this.refs.category.value });
    }

    handleSpecialIdChange() {
        this.setState({ specialId: this.refs.specialId.value });
    }

    handleSnippetChange() {
        this.setState({ snippet: this.refs.snippet.value });
    }

    handleOrigViewRenderedChange() {
        this.setState({ origViewRendered: this.refs.origViewRendered.checked });
    }

    submit() {
        this.setState({ submitting: true }, () => {
            const { state } = this;
            this.sendData({
                    title: state.title,
                    type: state.type,
                    category: state.category,
                    content: this.refs.editor.getContent('html'),
                    snippet: state.snippet,
                    public: state.public,
                    updated: new Date().toISOString(),
                    includes: state.includes,
                    initScript: state.initScript,
                    widgetTemplate: state.widgetTemplate,
                    specialId: state.specialId
                })
                .then(() => this.setState({ submitting: false }));
        });
    }

    render() {
        const { post } = this.props;
        return (
            <div className="EditPost">
                <nav style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li>
                            <Link to="/admin">Admin Index</Link>
                        </li>
                        <li>
                            <button type="button"
                                    className="CircleButton CircleButton-Big ButtonGreen"
                                    onClick={ this.submit }>
                                <span className="CircleButton-Text">{String.fromCharCode(0x2713)}</span>
                            </button>
                        </li>
                    </ul>
                </nav>
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
                    <label htmlFor="category">Category:</label>
                    <input type="text"
                           name="category"
                           value={ this.state.category }
                           ref="category"
                           onChange={ this.handleCategoryChange }
                           />
                </div>
                <div>
                    <label htmlFor="specialId">Custom ID:</label>
                    <input type="text"
                           name="specialId"
                           value={ this.state.specialId }
                           ref="specialId"
                           onChange={ this.handleSpecialIdChange }
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
                <div>Created: { post.get('created') }</div>
                <div>
                    <ProseMirror value={ this.state.content }
                                 onChange={ this.handleContentChange }
                                 options={ PROSE_MIRROR_OPTS }
                                 ref="editor">
                    </ProseMirror>
                </div>
                <div>
                    <label htmlFor="snippet">Snippet:</label>
                </div>
                <div>
                    <textarea value={ this.state.snippet }
                              style={{ width: '100%', height: 70 }}
                              name="snippet"
                              ref="snippet"
                              onChange={ this.handleSnippetChange }
                              />
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
                    <label htmlFor="widgetTemplate">Widget Template (within):</label>
                </div>
                <div>
                    <textarea value={ this.state.widgetTemplate }
                              style={{ width: '100%' }}
                              name="widgetTemplate"
                              ref="widgetTemplate"
                              onChange={ this.handleWidgetTemplateChange }
                              />
                </div>
                <div style={{ marginTop: 100 }}>
                    <div style={{ paddingTop: '2rem', borderTop: `thin solid ${realLightGray}` }}>
                        <div style={{ float: 'right' }}>
                            <input type="checkbox"
                                   ref="origViewRendered"
                                   onChange={ this.handleOrigViewRenderedChange }
                                   name="origViewRendered"
                                   checked={ this.state.origViewRendered }
                                   />
                            <label htmlFor="origViewRendered">Rendered</label>
                        </div>
                        <h3>Original post</h3>
                    </div>
                    {
                        this.state.origViewRendered ?
                            <div dangerouslySetInnerHTML={{ __html: this.props.post.get('content', '[[no content]]') }}></div> :
                            <div><code><pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>{
                                this.props.post.get('content', '[[no content]]')
                            }</pre></code></div>
                    }
                </div>
            </div>
        );
    }
}
