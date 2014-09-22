/**
 * Posts Store
 */

'use strict';

var _ = require('underscore');
var ajax = require('../util/ajax');
var Store = require('./Store');

function fetchRemote(path, cb) {
    ajax.get(path, {
        json: true,
        success: cb,
        error: function() {
            // ?
        }
    });
}

function ActiveStore() {
    Store.apply(this, arguments);
}

_.extend(ActiveStore.prototype, Store.prototype, {

    getURL: function() {
        if (DEBUG) {
            console.warn(
                "ActiveStore instance called without a #getURL implementation"
            );
        }
    },

    get: function(id, cb) {
        var store = this;
        var item = Store.prototype.get.call(this, id);

        if (!item) {
            fetchRemote(this.getURL(id), function(json) {
                var data = json;
                if (json) {
                    data = json[store.name];
                    store.set(id, data);
                }
                cb(data);
            });
        } else {
            cb(item);
        }
    }

});

module.exports = ActiveStore;