var AppDispatcher = require('../../dispatcher/AppDispatcher')
, EventEmitter = require('events').EventEmitter
, WunderlistDashboardConstants = require('../../constants/wunderlist/WunderlistDashboardConstants.js')
, nlp = require('nlp_compromise')
, moment = require('moment')
;

var CHANGE_EVENT = 'change';

// Array of list data objects
var _listData = [];

// Mapping of list id to list title
var _listNameMap = {};

// Mapping of list id to array of task objects
var _taskMap = {};

// Mapping of word to word count
var _wordCountMap = {};

//Mapping of list title to list length
var _listCountMap = [];

//Mapping of list title to average list item age
var _listAvgAgeMap = [];

// number of lists
var _listCount = 0;

// flag denoting if loading is happening.
var _isLoading = false;

function handleListsWithTasks( lists ) {
  generateNameMapForListData( lists );
  for( var i = 0; i<lists.length; i++ ) {
    var list = lists[i];
    var listId = list.id;
    receiveListTasks( listId, list.tasks );
    _taskMap[listId.toString()] = _taskMap[listId.toString()] ? _taskMap[listId.toString()] : {};
    _taskMap[listId.toString()].tasksCompleted = list.tasksCompleted;
  }
}


function generateNameMapForListData( lists ) {
  _listCount = lists.length;
  lists.map(function( list, index, array ) {
    _listNameMap[list.id] = list.title;
  });
}
//TODO: Refactor this into smaller functions
function receiveListTasks( listId, tasks ) {
  _taskMap[listId] = _taskMap[listId] ? _taskMap[listId] : {};
  _taskMap[listId].tasks = tasks;

  //Make ListCountMap
  var name = _listNameMap[listId];
  var count = tasks.length;
  _listCountMap.push ({label: name, value: count});

  //Make ListAvgAgeMap
  var allTaskAges = [];
  for( var i = 0; i<count; i++ ) {
    var taskOne = tasks[i];
    var now = moment();
    var momentCreated = moment(taskOne.created_at);
    var taskAge = now.diff(momentCreated, 'days');
    allTaskAges.push(taskAge);
  }
  var sum = 0;
  for( var i = 0; i < count; i++ ){
    sum += parseInt( allTaskAges[i], 10 );
  }
  var avg =  count > 0 ? Math.round(sum/count) : 1;
  _listAvgAgeMap.push({list: name, average: avg});

  //NLP
  tasks.map( function( task, index, array ) {
    var sentences = nlp.tokenize(task.title);
    sentences.map( function( sentenceTokens, index, array ) {
      sentenceTokens.tokens.map( function( tokenObj, index, array ) {
        var token = tokenObj.normalised;
        if( !_wordCountMap[token] ) {
          _wordCountMap[token] = 0;
        }
        _wordCountMap[token]++;
      });
    });
  });
}

var WunderlistDashboarStore = Object.assign({}, EventEmitter.prototype, {
  getIsLoading: function() {
    return _isLoading;
  },
  getListNameMap: function() {
    return _listNameMap;
  },

  getListData: function() {
    return _listData;
  },

  getTaskMap: function() {
    return _taskMap;
  },

  getListCount: function() {
    return _listCount;
  },

  getTaskWordsWithCount: function() {
    var result = [];
    for( var token in _wordCountMap ) {
      var tokenCount = _wordCountMap[token];
      result.push( { "word": token, "count": tokenCount } );
    }
    return result;
  },

  getListsWithCount: function() {
    return _listCountMap;
  },

  getListsWithCountFiltered : function () {
    if (_listCountMap.length < 6) {
      return _listCountMap;
    } else {
      _listCountMap.sort(function(a, b) {
        return b.value - a.value;
      });
      return _listCountMap.slice(0,5);
    }
  },

  getListsWithAverageAge: function() {
    if (_listAvgAgeMap.length < 10) {
      return _listAvgAgeMap;
    } else {
      _listAvgAgeMap.sort(function (a, b) {
        return b.average - a.average;
      });
      return _listAvgAgeMap.slice(0, 9);
    }
  },

  getTasksWithTimeFormat: function() {
    var taskMap = this.getTaskMap();
    var rows = [];
    for( var listId in taskMap ) {
      var tasks = taskMap[listId].tasks ? taskMap[listId].tasks : [];
      var tasksCompleted = taskMap[listId].tasksCompleted ? taskMap[listId].tasksCompleted : [];
      var allTasks = tasks.concat(tasksCompleted);

      allTasks.sort(function(a, b) {
        a = new Date(a.created_at);
        b = new Date(b.created_at);
        return a>b ? -1 : a<b ? 1 : 0;
      });

      for (var i = 0; i < allTasks.length; i++) {
        var task = allTasks[i];
        var completed = task.completed ? moment(task.completed_at).format("MM/DD/YY HH:mm") : "";
        var created = moment(task.created_at).format("MM/DD/YY HH:mm");
        rows.push({task: task, created: created, completed: completed});
      }
    }
    return rows;
  },

  //    get the highest occurring weekday (or days)
  getMostProductiveDay: function(isCompleted) {
    var dayMap = this.getWeeklyProductivity(isCompleted);

    if (dayMap) {
      var maxDay = Object.keys(dayMap).reduce(function(a, b) {
        return dayMap[a] > dayMap[b] ? a : b;
      });
      return maxDay;
    } else {
      return null;
    }
  },
  //    get all completed tasks by day of week mapped to count
  getWeeklyProductivity: function(isCompleted) {
    var now = moment();
    var startHistory = moment().subtract(5, 'years');
    var tasks = this.getTasksInTimeRangeWithCompletion( startHistory, now, isCompleted );
    //    determine the weekday of each task
    var dayMap = {};
    if ( tasks.length > 0 ) {
      for (var i = 0; i<tasks.length; i++) {
        var taskSingle= tasks[i];
        var day = moment(taskSingle.completed_at).format('dddd');
        if (dayMap[day] == null)
        dayMap[day] = 1;
        else
        dayMap[day]++;
      }
      return dayMap;
    }
  },

  getMostAmbitiousDay: function() {
    var dayMap = this.getCreativityByDay();

    if (dayMap) {
      var maxDay = Object.keys(dayMap).reduce(function(a, b) {
        return dayMap[a] > dayMap[b] ? a : b;
      });
      return maxDay;
    } else {
      return null;
    }
  },

  //    get all completed tasks by day of week mapped to count
  getCreativityByDay: function () {
    var now = moment();
    var startHistory = moment().subtract(5, 'years');
    var tasks = this.getTasksInTimeRange(startHistory, now);
    var dayMap = {};
    if (tasks.length > 0) {
      for (var i = 0; i<tasks.length; i++) {
        var taskSingle= tasks[i];
        var day = moment(taskSingle.created_at).format('dddd');
        if (dayMap[day] == null)
        dayMap[day] = 1;
        else
        dayMap[day]++;
      }
      return dayMap;
    }
  },

  //    get most frequent hour of completion
  getMostProductiveHour: function(isCompleted) {
    var hourMap = this.getHourlyProductivity(isCompleted);

    if (hourMap) {
      var maxHour = Object.keys(hourMap).reduce(function(a, b) {
        return hourMap[a] > hourMap[b] ? a : b;
      });
      return(moment(maxHour, "HH").format("h A"));
    } else {
      return null;
    }

  },

  //    map all completed tasks by hour to count
  getHourlyProductivity: function(isCompleted) {
    var now = moment();
    var startHistory = moment().subtract(5, 'years');
    var tasks = this.getTasksInTimeRangeWithCompletion( startHistory, now, isCompleted );
    //    determine the hour of each task
    var hourMap = {};
    if ( tasks.length > 0 ) {
      for (var i = 0; i<tasks.length; i++) {
        var taskSingle= tasks[i];
        var hour = moment(taskSingle.completed_at).format('HH');
        if (hourMap[hour] == null)
        hourMap[hour] = 1;
        else
        hourMap[hour]++;
      }
      return hourMap;
    }
  },

  getOldestTask: function() {
    var now = moment();
    var startHistory = moment().subtract(5, 'years');
    var tasks = this.getTasksInTimeRangeWithCompletion( startHistory, now, false );
    if (tasks) {
      var startdate = new Date().toISOString();
      var oldestTask = {
        'created_at': startdate,
        'title': "No Data"
      };
      for (var i = 0; i < tasks.length; i++ ) {
        var taskSingle = tasks[i];
        var timeTaskSingle = moment(taskSingle.created_at);
        var oldTime = moment(oldestTask.created_at);
        if ( timeTaskSingle.isBefore(oldTime) ) {
          oldestTask = taskSingle;
        }
      }
      return oldestTask;
    } else {
      return "No Data";
    }

  },


  getYoungestTask: function(){
    var now = moment();
    var startHistory = moment().subtract(5, 'years');
    var tasks = this.getTasksInTimeRangeWithCompletion( startHistory, now, false );
    if (tasks) {
      var startdate = new Date(86400000).toISOString();
      var youngestTask = {
        'created_at': startdate,
        'title': "No Data"
      };
      for (var i = 0; i < tasks.length; i++ ) {
        var taskSingle = tasks[i];
        var timeTaskSingle = moment(taskSingle.created_at);
        var youngTime = moment(youngestTask.created_at);
        if ( timeTaskSingle.isAfter(youngTime) ) {
          youngestTask = taskSingle;
        }
      }
      return youngestTask;
    } else {
      return "No Data";
    }

  },

  getTasksInTimeRangeWithCompletion: function( startTime, endTime, isCompleted ) {
    var tasksInRangeWithCompletion = [];
    for( var listId in _taskMap ) {
      var tasks = _taskMap[listId].tasks;
      if( isCompleted ) {
        tasks = _taskMap[listId].tasksCompleted;
      }
      if( tasks ) {
        for( var i = 0; i<tasks.length; i++ ) {
          var taskSingle = tasks[i];
          var momentCreated = moment(taskSingle.created_at);
          var isInRange = momentCreated.isBetween(startTime, endTime);
          if( isInRange ) {
            tasksInRangeWithCompletion.push( taskSingle );
          }
        }
      }
    }
    return tasksInRangeWithCompletion;
  },
  //TODO: use quantity to limit these tasks
  getRecentTasksByList: function(daysPrior, quantity ) {
    var now = moment();
    var countStart = moment().subtract(daysPrior, 'days');
    var all = this.getTasksInTimeRangeByList(countStart, now);
    return all;
  },

  getPercentCompletion: function(daysPrior) {
    var percentCompleteMap = [];
    var now = moment();
    var countStart = moment().subtract(daysPrior, 'days');
    var set = this.getTasksInTimeRangeByListSortCompletion(countStart, now);
    for (var i = 0; i< set.length; i++) {
      var setSingle = set[i];
      var calc = Math.round((setSingle.completed/setSingle.all) * 100) / 100;
      var complete = setSingle.completed;
      var percentage = complete == 0 ?  0 : calc;
      if (percentage > 0 ) {
        percentCompleteMap.push({list: setSingle.name, percent: percentage});
      }
    }
    if (percentCompleteMap.length < 10) {
      return percentCompleteMap;
    } else {
      percentCompleteMap.sort(function(a, b) {
        return b.value - a.value;
      });
      return percentCompleteMap.slice(0,9);
    }
  },

  getTasksInTimeRangeByListSortCompletion: function(startTime, endTime) {
    var lillistNameMap = this.getListNameMap();
    var inRangewithCompletionCounts = [];
    for (var listId in _taskMap) {
      var allInRange = [];
      var completedInRange = [];
      var tasks = this.getAllTasksForListId( listId );
      tasks = this.sortTasksByCreated( tasks );
      for(var i = 0; i< tasks.length; i++) {
        var taskSingle = tasks[i];
        var momentCreated = moment(taskSingle.created_at);
        var isInRange = momentCreated.isBetween(startTime, endTime);
        if(isInRange && taskSingle.completed) {
          completedInRange.push( taskSingle );
          allInRange.push( taskSingle);
        } else if (isInRange) {
          allInRange.push( taskSingle);
        }
      }
      inRangewithCompletionCounts.push({name:lillistNameMap[listId], all: allInRange.length, completed: completedInRange.length});
    }
    return inRangewithCompletionCounts;
  },

  getTasksInTimeRangeByList: function(startTime, endTime) {
    var lillistNameMap = this.getListNameMap();
    var listTasksInRangeMap = [];
    for (var listId in _taskMap) {
      var allInRange = [];
      var tasks = this.getAllTasksForListId(listId);
      if( tasks ) {
        for(var i = 0; i< tasks.length; i++) {
          var taskSingle = tasks[i];
          var momentCreated = moment(taskSingle.created_at);
          var isInRange = momentCreated.isBetween(startTime, endTime);
          if(isInRange) {
            allInRange.push( taskSingle );
          }
        }
        allInRange = this.sortTasksByCreated( allInRange );
      }
      listTasksInRangeMap.push({name:lillistNameMap[listId], tasks: allInRange});
    }
    return listTasksInRangeMap;
  },

  getTasksInTimeRange: function( startTime, endTime ) {
    var tasksInRange = [];
    for( var listId in _taskMap ) {
      var tasks = this.getAllTasksForListId( listId );
      tasks = this.sortTasksByCreated( tasks );
      if( tasks && tasks.length ) {
        for( var i = 0; i<tasks.length; i++ ) {
          var taskSingle = tasks[i];
          var momentCreated = moment(taskSingle.created_at);
          var isInRange = momentCreated.isBetween(startTime, endTime);
          if( isInRange) {
            tasksInRange.push( taskSingle );
          }
        }
      }
    }
    return tasksInRange;
  },

  getListsWithRecentCountCompletion: function( daysPrior, isCompleted) {
    var listRecentCompleteCountMap = [];
    var now = moment();
    var countStart = moment().subtract(daysPrior, 'days');
    var tasks = this.getTasksInTimeRangeWithCompletion(countStart, now, isCompleted);
    var lillistNameMap = this.getListNameMap();
    var hist = {};
    tasks.map( function (task) {
      if (lillistNameMap[task.list_id] in hist) {
        hist[lillistNameMap[task.list_id]] ++;
      } else {
        hist[lillistNameMap[task.list_id]] = 1;
      }
    } );

    for (var key in hist) {
      if (hist.hasOwnProperty(key)) {
        listRecentCompleteCountMap.push({label:key, value:hist[key]});
      };
    }

    if (listRecentCompleteCountMap.length < 6) {
      return listRecentCompleteCountMap;
    } else {
      listRecentCompleteCountMap.sort(function(a, b) {
        return b.value - a.value;
      });
      return listRecentCompleteCountMap.slice(0,5);
    }
  },

  getListsWithRecentCountAll: function(daysPrior) {
    var listRecentCountMap = [];
    var now = moment();
    var countStart = moment().subtract(daysPrior, 'days');
    var tasks = this.getTasksInTimeRange(countStart, now);
    var lillistNameMap = this.getListNameMap();
    var hist = {};
    tasks.map( function (task) {
      if (lillistNameMap[task.list_id] in hist) {
        hist[lillistNameMap[task.list_id]] ++;
      } else {
        hist[lillistNameMap[task.list_id]] = 1;
      }
    } );

    for (var key in hist) {
      if (hist.hasOwnProperty(key)) {
        listRecentCountMap.push({label:key, value:hist[key]});
      };
    }
    if (listRecentCountMap.length < 6) {
      return listRecentCountMap;
    } else {
      listRecentCountMap.sort(function(a, b) {
        return b.value - a.value;
      });
      return listRecentCountMap.slice(0,5);
    }
  },

  getAllTasksForListId: function( listId ) {
    var result = [];
    if( _taskMap[listId].tasks ) {
      result = result.concat( _taskMap[listId].tasks );
    }
    if( _taskMap[listId].tasksCompleted ) {
      result = result.concat( _taskMap[listId].tasksCompleted );
    }
    return result;
  },

  sortTasksByCreated: function( tasks ) {
    return tasks.sort(function(a, b) {
      return moment(b.created_at).unix() - moment(a.created_at).unix();
    });
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

AppDispatcher.register(function(action){
  switch( action.actionType ) {
    case WunderlistDashboardConstants.RECEIVE_LIST_WITH_TASKS:
      handleListsWithTasks( action.lists );
      WunderlistDashboarStore.emitChange();
      break;
    case WunderlistDashboardConstants.RECEIVE_LIST_DATA:
      _listData = action.lists;
      generateNameMapForListData( action.lists );
      WunderlistDashboarStore.emitChange();
      break;
    case WunderlistDashboardConstants.RECEIVE_LIST_TASKS:
      receiveListTasks( action.listId.toString(), action.tasks );
      WunderlistDashboarStore.emitChange();
      break;
    case WunderlistDashboardConstants.RECEIVE_LIST_COMPLETED_TASKS:
      _taskMap[action.listId.toString()] = _taskMap[action.listId.toString()] ? _taskMap[action.listId.toString()] : {};
      _taskMap[action.listId.toString()].tasksCompleted = action.tasks;
      WunderlistDashboarStore.emitChange();
      break;
    case WunderlistDashboardConstants.TASKS_FETCH_STARTED:
      _isLoading = true;
      WunderlistDashboarStore.emitChange();
      break;
    case WunderlistDashboardConstants.ALL_TASKS_FETCHED:
      _isLoading = false;
      WunderlistDashboarStore.emitChange();
      break;
  }

});

module.exports = WunderlistDashboarStore;
