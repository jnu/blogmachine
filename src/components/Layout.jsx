/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var Link = require('react-router-component').Link;
var ajax = require('../util/ajax');

function setReadyStatus(status) {
    /* jshint validthis: true */
    if (this.isMounted()) {
        this.setState({ ready: status });
    }
}

var Layout = React.createClass({

    getInitialState: function() {
        return {
            ready: true
        };
    },

    componentWillMount: function() {
        ajax.on('start', setReadyStatus.bind(this, false));
        ajax.on('end', setReadyStatus.bind(this, true));
    },

    render: function() {
        var closeCls = 'face close- ' + (this.state.ready ? 'hide' : '');
        var openCls = 'face open- ' + (this.state.ready ? '' : 'hide');

        return (
            <div id="layout">
                <div className="flex">
                    <section id="left">
                        {/* render both open and close so images preload */}
                        <div className={closeCls} />
                        <div className={openCls} />
                    </section>
                    <section id="right">
                        <nav>
                            <Link href="/post/foo" global={true}>
                                Foo Post
                            </Link>
                            <Link href="/post/bar" global={true}>
                                Bar Post
                            </Link>
                        </nav>
                        {this.props.children}
                    </section>
                </div>
                <footer>
                    By Joe Nudell, 2014
                </footer>
            </div>
        );
    }

});

module.exports = Layout;