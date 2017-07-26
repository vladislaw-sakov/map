var request = require('request-json')
    , async = require('async')
    ;

function Wunderlist(clientId, accessToken) {
    this.client = request.createClient('https://a.wunderlist.com');
    this.client.headers['X-Access-Token'] = accessToken;
    this.client.headers['X-Client-ID'] = clientId;
};

Wunderlist.prototype.getUser = function(callback) {
    this.client.get('/api/v1/user', {}, function(err, res, body) {
        if (err) {
            return callback(err);
        }
        callback(null, body);
    });
};

Wunderlist.prototype.getListsWithTasks = function(callback) {
    this.getLists((err, lists)=>{
        if( err ) {
            return callback(err);
        }

        async.each(lists, (list, callbackLists)=>{
            async.parallel([
                (callbackA)=>{
                    this.getTasksForList( list.id, (err, tasks)=>{
                        if( err ) {
                            return callbackA(err);
                        }
                        list.tasks = tasks;
                        callbackA();
                    });
                },
                (callbackB)=>{
                    this.getTasksCompletedForList( list.id, (err, tasksCompleted)=>{
                        if( err ) {
                            return callbackB(err);
                        }
                        list.tasksCompleted = tasksCompleted;
                        callbackB();
                    });
                }
            ], (err)=>{
                callbackLists(err, lists);
            });

        }, (err)=> {
            if( err ) {
                callback(err);
            } else {
                callback(null, lists);
            }
        });
    });
};

Wunderlist.prototype.getLists = function(callback) {
    this.client.get('/api/v1/lists', {}, function(err, res, body) {
       if (err) {
           return callback(err);
       }
       callback(null, body);
    });
};

Wunderlist.prototype.getTasksForList = function(listId, callback) {
    this.client.get('/api/v1/tasks?list_id=' + listId, {}, function(err, res, body) {
        if (err) {
            return callback(err);
        }
        callback(null, body);
    });
};

Wunderlist.prototype.getTasksCompletedForList = function(listId, callback) {
    this.client.get('/api/v1/tasks?completed=true&list_id=' + listId, {}, function(err, res, body) {
        if (err) {
            return callback(err);
        }
        callback(null, body);
    });
};

Wunderlist.prototype.createWebhookForList = function(listId, url, callback) {
    var params = {
        'list_id': listId,
        'url': url,
        'processor_type': 'generic',
        'configuration': ''
    };
    this.client.post('/api/v1/webhooks', params, function(err, res, body) {
        if (err) {
            return callback(err);
        }
        callback(null, body);
    });
};

Wunderlist.prototype.getWebhooksForList = function(listId, callback) {
    this.client.get('/api/v1/webhooks?list_id='+listId, {}, function(err, res, body) {
        if (err) {
            return callback(err);
        }
        callback(null, body);
    });
};

Wunderlist.prototype.deleteWebhook = function(webhookId, callback) {
    this.client.del('/api/v1/webhooks/'+webhookId, {}, function(err, res, body) {
        if (err) {
            callback ? callback(err) : console.log(err);
        } else if (callback) {
            callback(null, body);
        }
    });
};

Wunderlist.prototype.createComment = function(taskId, comment, callback) {
    var data = {
        task_id: taskId,
        text: comment
    };
    this.client.post('/api/v1/task_comments', data, function(err, res, body) {
        if (err) {
            callback ? callback(err) : console.log(err);
        } else if (callback) {
            callback(body);
        }
    });
};

module.exports = Wunderlist;
