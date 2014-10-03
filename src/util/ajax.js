/**
 * Some AJAX sugar
 */
/* jshint browser: true */

'use strict';

var merge = require('utils-merge');
var EventEmitter = require('node-event-emitter').EventEmitter;
var ajax;

function noop() {}

// Handle return of request, calling appropriate callbacks
function _dispatch(xhr, success, error) {
    return function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200 || xhr.status === 0) {
                success(xhr.responseText);
                this.emit('end');
            } else {
                error(xhr.responseText);
                this.emit('error');
            }
        }
    };
}

// Make a request
function _req(method, path, opts) {
    // Duck-type the environment ... return null for non-browser
    if (typeof window === 'undefined') {
        return opts.success(null);
    }

    var xhr = new XMLHttpRequest();
    var success = opts.success || noop;
    var realSuccess = success;
    var error = opts.error || noop;
    var data = opts.data;

    // Parse return as json if specified
    if (opts.json) {
        success = function(txt) {
            realSuccess(JSON.parse(txt + ""));
        };
    }

    // Set type header, automatically stringify JSON
    if (opts.type) {
        xhr.setRequestHeader('Content-Type', opts.type);
        if (opts.type === 'application/json' && typeof data !== 'string') {
            data = JSON.stringify(data);
        }
    }

    // Send out request
    xhr.onreadystatechange = _dispatch(xhr, success, error).bind(ajax);
    xhr.open(method, path, true);
    ajax.emit('start');
    xhr.send(data || null);
}


/**
 * @typedef {ReqOpts}
 * @property {Function} success Success callback
 * @property {Function} error   Error callback
 * @property {mixed}    [data]  Data to send
 * @property {String}   [type]  Type of data to send. Type 'application/json'
 *                              is automatically stringified.
 * @property {Boolean}  [json]  Whether to parse result as JSON
 */

ajax = {

    /**
     * Perform GET request
     * @param {String}  path Path to get
     * @param {ReqOpts} opts Request options
     */
    get: _req.bind(ajax, 'GET'),


    /**
     * Perform POST request
     * @param {String}  path Path to get
     * @param {ReqOpts} opts Request options
     */
    post: _req.bind(ajax, 'POST')

};

// extend ajax with EventEmitter
merge(ajax, new EventEmitter())

module.exports = ajax;
global.ajax = ajax;