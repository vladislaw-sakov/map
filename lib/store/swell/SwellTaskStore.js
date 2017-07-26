var AppDispatcher = require('../../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TaskConstants = require('../../constants/swell/SwellTaskConstants');


var _tasks = [];
var _archive = {};


function create(id, description) {
  _tasks.unshift({
    id: id,
    is_completed: false,
    description: description
  });
}

function update(id, updated_obj) {
  for (var i = 0; i < _tasks.length; i++) {
    if (_tasks[i].id === id) {
      _tasks[i] = Object.assign({}, _tasks[i], updated_obj);
    }
  };
}

function destroy(id) {
  for (var i = 0; i < _tasks.length; i++) {
    if (_tasks[i].id === id) {
      _tasks.splice(i, 1);
    }
  };
}

var TaskStore = Object.assign({}, EventEmitter.prototype, {

  get: function(id) {
    _tasks.forEach(t => {
      if (t.id === id) {
        return t;
      }
    });
  },

  getAll: function() {
    return _tasks;
  },

  emitChange: function() {
    this.emit('change');
  },

  addChangeListener: function(callback) {
    this.on('change', callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener('change', callback);
  }
});

AppDispatcher.register(function(action) {
  var description;

  switch (action.actionType) {
    case TaskConstants.TASK_CREATE_ALL:
      _tasks = action.tasks;
      if (_tasks) {
        TaskStore.emitChange();
      }
      break;

    case TaskConstants.TASK_CREATE:
      description = action.description.trim();
      if (description !== '') {
        create(action.id, description);
        TaskStore.emitChange();
      }
      break;

    case TaskConstants.TASK_UPDATE:
      if (action.updated_obj.description.trim() !== '') {
        update(action.temp_id, action.updated_obj);
        TaskStore.emitChange();
      }
      break;

    case TaskConstants.TASK_DESTROY:
      destroy(action.id);
      TaskStore.emitChange();
    break;

    case TaskConstants.TASK_UNDO_COMPLETE:
      update(action.id, {is_completed: false});
      TaskStore.emitChange();
      break;

    case TaskConstants.TASK_CLEAR:
      _tasks = [];
      TaskStore.emitChange();
      break;

    case TaskConstants.TASK_COMPLETE:
      update(action.id, {is_completed: true});
      TaskStore.emitChange();
      break;

    default:
  }
});

module.exports = TaskStore;
