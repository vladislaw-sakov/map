/**
 * Created by robby on 12/7/15.
 */

/**
 * Interface for abstracting token-related logic when making HTTP requests to
 * API
 *
 * @lidatong
 */

'use strict';

/**
 * TokenAPI: Definition of TokenAPI interface for attaching token to client ajax requests
 *
 * Example:
 *     tokenAPI = new TokenAPI({baseUrl: "http://localhost:8080"});
 *     tokenAPI.get(url, callback);
 */
class TokenAPI {

    /**
     * Instantiates a TokenAPI object, supporting ajax calls by wrapping in
     * the user token.
     *
     * @param  {object} options Must contain a token property
     * @return {object} the newly-created instance
     */
    constructor(options) {
        this.token = options && options.token;
    }


    /**
     * get(): Wrapper for GET requests
     *
     * @param  {string} url: route
     * @param  {function} callback: executed on ajax's completion
     */
    get(url, callback) {
        var xhReq = new XMLHttpRequest();
        xhReq.open('GET', url, true);
        xhReq.withCredentials = true;
        xhReq.setRequestHeader('Content-type', 'application/JSON');
        if (this.token) {
            xhReq.setRequestHeader('Authorization', 'Bearer ' + this.token);
        }
        xhReq.onreadystatechange = function() {
            if (xhReq.readyState === 4) {
                if (xhReq.status === 200) {
                    try {
                        var res = JSON.parse(xhReq.response);
                    } catch (e) {
                        return callback(e);
                    }
                    if (!res.success && res.hasOwnProperty('success')) {
                        return callback(new Error(res.message || res.code || "Server responded with false in the success parameter (no message or code)"));
                    }
                    return callback(null, res);
                } else {
                    return callback(new Error("Server responded with status: " + xhReq.status));
                }
            }
        };
        xhReq.send();
    }


    /**
     * post(): Wrapper for POST requests. Signup/Login handled separately
     * due to Cookie (this is for general POST requests only)
     *
     * @param  {string} url: route
     * @param  {object} postData: an object with params passed to POST
     * @param  {function} callback: executed on ajax's completion
     */
    post(url, postData, callback) {
        var xhReq = new XMLHttpRequest();
        xhReq.open('POST', url, true);
        xhReq.withCredentials = true;
        xhReq.setRequestHeader('Content-type', 'application/JSON');
        if (this.token) {
            xhReq.setRequestHeader('Authorization', 'Bearer ' + this.token);
        }
        xhReq.onreadystatechange = function() {
            if (xhReq.readyState === 4) {
                if (xhReq.status === 200) {
                    try {
                        var res = JSON.parse(xhReq.response);
                    } catch (e) {
                        return callback ? callback(e) : null;
                    }
                    if (!res.success && res.hasOwnProperty('success')) {
                        return callback ? callback(new Error(res.message || res.code || "Server responded with false in the success parameter (no message or code)")) : null;
                    }
                    return callback ? callback(null, res) : null;
                } else {
                    return callback ? callback(new Error("Server responded with status: " + xhReq.status)) : null;
                }
            }
        };
        xhReq.send(JSON.stringify(postData));
    }


    /**
     * put(): Wrapper for PUT requests
     *
     * @param  {string} url: route
     * @param  {object} putData: an object with params passed to PUT
     * @param  {function} callback: executed on ajax's completion
     */
    put(url, putData, callback) {
        var xhReq = new XMLHttpRequest();
        xhReq.open('PUT', url, true);
        xhReq.withCredentials = true;
        xhReq.setRequestHeader('Content-type', 'application/JSON');
        if (this.token) {
            xhReq.setRequestHeader('Authorization', 'Bearer ' + this.token);
        }
        xhReq.onreadystatechange = function() {
            if (xhReq.readyState === 4) {
                if (xhReq.status === 200) {
                    try {
                        var res = JSON.parse(xhReq.response);
                    } catch (e) {
                        return callback(e);
                    }
                    if (!res.success && res.hasOwnProperty('success')) {
                        return callback(new Error(res.message || res.code || "Server responded with false in the success parameter (no message or code)"));
                    }
                    return callback(null, res);
                } else {
                    return callback(new Error("Server responded with status: " + xhReq.status));
                }
            }
        };
        xhReq.send(JSON.stringify(putData));
    }

    /**
     * del(): Wrapper for POST requests
     *
     * @param  {string} url: route
     * @param  {object} deleteData: an object with params passed to DELETE
     * @param  {function} callback: executed on ajax's completion
     */
    del(url, deleteData, callback) {
        var xhReq = new XMLHttpRequest();
        xhReq.open('DELETE', url, true);
        xhReq.withCredentials = true;
        xhReq.setRequestHeader('Content-type', 'application/JSON');
        if (this.token) {
            xhReq.setRequestHeader('Authorization', 'Bearer ' + this.token);
        }
        xhReq.onreadystatechange = function() {
            if (xhReq.readyState === 4) {
                if (xhReq.status === 200) {
                    try {
                        var res = JSON.parse(xhReq.response);
                    } catch (e) {
                        return callback(e);
                    }
                    if (!res.success && res.hasOwnProperty('success')) {
                        return callback(new Error(res.message || res.code || "Server responded with false in the success parameter (no message or code)"));
                    }
                    return callback(null, res);
                } else {
                    return callback(new Error("Server responded with status: " + xhReq.status));
                }
            }
        };
        xhReq.send(JSON.stringify(deleteData));
    }
}


module.exports = TokenAPI;
