
class SimpleRequest {
    get(url, queryVars, callback) {
        var xhReq = new XMLHttpRequest();
        if( queryVars ) {
            url = url + formatQueryParams(queryVars);
        }
        xhReq.open('GET', url, true);
        xhReq.setRequestHeader('Content-type', 'application/json');
        xhReq.onreadystatechange = function() {
            if (xhReq.readyState === 4) {
                if (xhReq.status === 200) {
                    try {
                        var res = JSON.parse(xhReq.response);
                    } catch (e) {
                        return callback(e);
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
        xhReq.setRequestHeader('Content-type', 'application/JSON');
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
        xhReq.send(JSON.stringify(postData));
    }

    put(url, putData, callback) {
        var xhReq = new XMLHttpRequest();
        xhReq.open('PUT', url, true);
        xhReq.setRequestHeader('Content-type', 'application/JSON');
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

    delete(url, deleteData, callback) {
        var xhReq = new XMLHttpRequest();
        xhReq.open('DELETE', url, true);
        xhReq.setRequestHeader('Content-type', 'application/JSON');
        if (this.token) {
            xhReq.setRequestHeader('Authorization', 'Bearer ' + this.token);
        }
        xhReq.onreadystatechange = function () {
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

function formatQueryParams( params ){
    return "?" + Object
            .keys(params)
            .map(function(key){
                return key+"="+params[key]
            })
            .join("&")
}

module.exports = SimpleRequest;