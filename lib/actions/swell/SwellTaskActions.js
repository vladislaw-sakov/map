var AppDispatcher = require('../../dispatcher/AppDispatcher');
var TaskConstants = require('../../constants/swell/SwellTaskConstants');
var SwellAPIUtils = require('../../api/swell/SwellAPIUtils.js');

var apiUtils = new SwellAPIUtils({
  baseUrl: API_URL
});

var TaskActions = {

  get: function() {
    apiUtils.getTaskList((err, res) => {
      if (err) {
        throw new Error("Failed to get task list with error: " + err);
      } else {
        AppDispatcher.dispatch({
          actionType: TaskConstants.TASK_CREATE_ALL,
          tasks: res.data
        });
      }
    });
  },

  create: function(description) {
    var data = {};

    data.description = description;

    // generates base 36 hash code
    data.temp_id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);

    // This is an optimistic render
    AppDispatcher.dispatch({
      actionType: TaskConstants.TASK_CREATE,
      id: data.temp_id,
      description: description
    });
    apiUtils.createTask(data, (err, res) => {
      // the create failed, so update that id to be deleted
      if (err) {
        throw new Error("Failed to create task with error: " + err);
        this.destroy(data.temp_id);
      } else {
        AppDispatcher.dispatch({
          actionType: TaskConstants.TASK_UPDATE,
          temp_id: data.temp_id,
          updated_obj: data
        });
      }
    });
  },

  update: function(id, updated_obj) {
    AppDispatcher.dispatch({
      actionType: TaskConstants.TASK_UPDATE,
      temp_id: id,
      updated_obj: updated_obj
    });
    apiUtils.updateTask(updated_obj, (err, res) => {
      if (err) { // optimistic update, revert on failure
        throw new Error("Failed to update task with error: " + err);
      }
    });
  },

  archive: function(task_id) {
    this.destroy(task_id);
    var task = {
      id: task_id
    };
    apiUtils.archiveTask(task, (err, res) => {
      if (err) { // in case server fails to archive
        throw new Error("Failed to update task with error: " + err);
      }
    });
  },

  destroy: function(id) {
    AppDispatcher.dispatch({
      actionType: TaskConstants.TASK_DESTROY,
      id: id
    });
  },


  // clean up the previous user's store
  clear: function() {
    AppDispatcher.dispatch({
      actionType: TaskConstants.TASK_CLEAR
    });
  },


  /* fb sample code */
  toggleComplete: function(task) {
    var id = task.id;
    var actionType = task.is_completed ?
      TaskConstants.TASK_UNDO_COMPLETE :
      TaskConstants.TASK_COMPLETE;

    AppDispatcher.dispatch({
      actionType: actionType,
      id: id
    });
  }
};


module.exports = TaskActions;
