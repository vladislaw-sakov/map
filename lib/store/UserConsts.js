/**
 * Created by robby on 8/17/15.
 */

var _ = require('underscore');

var VIP_LEVEL_VALUE = 97;
module.exports.VIP_LEVEL_VALUE = VIP_LEVEL_VALUE;

var FTUE_LEVEL_VALUE = 83;
module.exports.FTUE_LEVEL_VALUE = FTUE_LEVEL_VALUE;

var PREMIUM_LEVEL_VALUE = 80;
module.exports.PREMIUM_LEVEL_VALUE = PREMIUM_LEVEL_VALUE;

var NEW_LEVEL_VALUE = 60;
module.exports.NEW_LEVEL_VALUE = NEW_LEVEL_VALUE;

var BUYER_LEVEL_VALUE = 40;
module.exports.BUYER_LEVEL_VALUE = BUYER_LEVEL_VALUE;

var SUPERUSER_LEVEL_VALUE = 30;
module.exports.SUPERUSER_LEVEL_VALUE = SUPERUSER_LEVEL_VALUE;

var STANDARD_LEVEL_VALUE = 20;
module.exports.STANDARD_LEVEL_VALUE = STANDARD_LEVEL_VALUE;

var DEFAULT_USER_LEVEL_VALUE = 15;
module.exports.DEFAULT_USER_LEVEL_VALUE = DEFAULT_USER_LEVEL_VALUE;

var EMPLOYEE_LEVEL_VALUE = 4;
module.exports.EMPLOYEE_LEVEL_VALUE = EMPLOYEE_LEVEL_VALUE;

var ADMINABLE_USER_LEVELS = [
    {"name": "VIP", "value": VIP_LEVEL_VALUE},
    {"name": "BUYER", "value": BUYER_LEVEL_VALUE},
    {"name": "STANDARD", "value": STANDARD_LEVEL_VALUE},
    {"name": "EMPLOYEE", "value": EMPLOYEE_LEVEL_VALUE}
];
module.exports.ADMINABLE_USER_LEVELS = ADMINABLE_USER_LEVELS;

var OTHER_USER_LEVELS = [
    {"name": "PREMIUM", "value": PREMIUM_LEVEL_VALUE},
    {"name": "FTUE", "value": FTUE_LEVEL_VALUE},
    {"name": "NEW", "value": NEW_LEVEL_VALUE},
    {"name": "SUPERUSER", "value": SUPERUSER_LEVEL_VALUE},
    {"name": "DEFAULT", "value": DEFAULT_USER_LEVEL_VALUE}
];

module.exports.USER_LEVELS = _.sortBy(OTHER_USER_LEVELS.concat(ADMINABLE_USER_LEVELS), function(level) { return level.value * -1; });

module.exports.SEEN_FIRST_TASK_CREATED = 'first_task_created';

module.exports.ROLE_TRAINING = "training";
module.exports.ROLE_CREATOR = "creator";
module.exports.ROLE_MANAGER = "taskmaster";
module.exports.ROLE_SUPERVISOR = "supervisor";
module.exports.ROLE_ADMIN = "admin";
