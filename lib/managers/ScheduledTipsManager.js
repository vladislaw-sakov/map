'use strict';

var UserActivityStreamManager = require('./UserActivityStreamManager.js')
, LogManager = require('./LogManager.js')
, JobManager = require('./JobManager.js')
, UserAlertsManager = require('./UserAlertsManager.js')
, EmailConstants = require('../constants/email/EmailConstants.js')
, async = require('async')
, fs = require('fs')
, templates = {}
;

function handleBatchId(uid, batchId) {
  var now = Math.round(new Date().getTime()/1000);
  switch(batchId) {
    case "XvnVwA_managing_time":
      // copy 1010432:11
      UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid("1010432", 11, uid).then((copyResult)=>{
        console.log("copied batchId: " + batchId + " to: " + uid);
      }).catch((error)=>{
        LogManager.logError("Failed to copy stream object for uid: "+uid+", batchId: "+batchId, error);
      });
      // copy 1010432:14
      UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid("1010432", 14, uid).then((copyResult)=>{
        console.log("copied batchId: " + batchId + " to: " + uid);
      }).catch((error)=>{
        LogManager.logError("Failed to copy stream object for uid: "+uid+", batchId: "+batchId, error);
      });

      // copy 1010432:17 SIX HOURS
      var targetTimeSix = now + 60 * 60 * 6; // 6 hours
      if(env.name === 'development') {
        targetTimeSix = now + 60 * 1 * 2; // Dev one minute
      }
      JobManager.createJob(targetTimeSix, 'copyStreamObjectWithSourceUidIdToTargetUid', ["1010432", 17, uid]);

      // copy 1010432:18 TWELVE HOURS
      var targetTimeTwelve = now + 60 * 60 * 12; // 6 hours
      if(env.name === 'development') {
        targetTimeTwelve = now + 60 * 1 * 4; // Dev one minute
      }
      JobManager.createJob(targetTimeTwelve, 'copyStreamObjectWithSourceUidIdToTargetUid', ["1010432", 18, uid]);
      break;
    case "XvnVwA_organized":

      // copy 1010432:19
      UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid("1010433", 19, uid).then((copyResult)=>{
        console.log("copied batchId: " + batchId + " to: " + uid);
      }).catch((error)=>{
        LogManager.logError("Failed to copy stream object for uid: "+uid+", batchId: "+batchId, error);
      });

      // copy 1010432:20
      UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid("1010433", 20, uid).then((copyResult)=>{
        console.log("copied batchId: " + batchId + " to: " + uid);
      }).catch((error)=>{
        LogManager.logError("Failed to copy stream object for uid: "+uid+", batchId: "+batchId, error);
      });
      // copy 1010432:21 SIX HOURS
      var targetTimeSix = now + 60 * 60 * 6; // 6 hours
      if(env.name === 'development') {
        targetTimeSix = now + 60 * 1 * 2; // Dev two minutes
      }
      JobManager.createJob(targetTimeSix, 'copyStreamObjectWithSourceUidIdToTargetUid', ["1010433", 21, uid]);

      // copy 1010432:22 TWELVE HOURS
      var targetTimeTwelve = now + 60 * 60 * 12; // 6 hours
      if(env.name === 'development') {
        targetTimeTwelve = now + 60 * 1 * 4; // Dev four minutes
      }
      JobManager.createJob(targetTimeTwelve, 'copyStreamObjectWithSourceUidIdToTargetUid', ["1010433", 22, uid]);
      break;
    case "XvnVwA_cooking":
      // copy 1010432:3
      UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid("1010434", 3, uid).then((copyResult)=>{
        console.log("copied batchId: " + batchId + " to: " + uid);
      }).catch((error)=>{
        LogManager.logError("Failed to copy stream object for uid: "+uid+", batchId: "+batchId, error);
      });

      // copy 1010432:28
      UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid("1010434", 28, uid).then((copyResult)=>{
        console.log("copied batchId: " + batchId + " to: " + uid);
      }).catch((error)=>{
        LogManager.logError("Failed to copy stream object for uid: "+uid+", batchId: "+batchId, error);
      });

      // copy 1010432:29 SIX HOURS
      var targetTimeSix = now + 60 * 60 * 6; // 6 hours
      if(env.name === 'development') {
        targetTimeSix = now + 60 * 1 * 2; // Dev one minute
      }
      JobManager.createJob(targetTimeSix, 'copyStreamObjectWithSourceUidIdToTargetUid', ["1010434", 29, uid]);

      // copy 1010432:30 TWELVE HOURS
      var targetTimeTwelve = now + 60 * 60 * 12; // 6 hours
      if(env.name === 'development') {
        targetTimeTwelve = now + 60 * 1 * 4; // Dev one minute
      }
      JobManager.createJob(targetTimeTwelve, 'copyStreamObjectWithSourceUidIdToTargetUid', ["1010434", 30, uid]);
      break;
    case "XvnVwA_making_time":
      // copy 1010432:21
      UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid("1010435", 21, uid).then((copyResult)=>{
        console.log("copied batchId: " + batchId + " to: " + uid);
      }).catch((error)=>{
        LogManager.logError("Failed to copy stream object for uid: "+uid+", batchId: "+batchId, error);
      });

      // copy 1010432:22
      UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid("1010435", 22, uid).then((copyResult)=>{
        console.log("copied batchId: " + batchId + " to: " + uid);
      }).catch((error)=>{
        LogManager.logError("Failed to copy stream object for uid: "+uid+", batchId: "+batchId, error);
      });

      // copy 1010432:24 SIX HOURS
      var targetTimeSix = now + 60 * 60 * 6; // 6 hours
      targetTimeSix = now + 60 * 1 * 2; // Dev one minute
      JobManager.createJob(targetTimeSix, 'copyStreamObjectWithSourceUidIdToTargetUid', ["1010435", 24, uid]);

      // copy 1010432:25 TWELVE HOURS
      var targetTimeTwelve = now + 60 * 60 * 12; // 6 hours
      if(env.name === 'development') {
        targetTimeTwelve = now + 60 * 1 * 4; // Dev one minute
      }
      JobManager.createJob(targetTimeTwelve, 'copyStreamObjectWithSourceUidIdToTargetUid', ["1010435", 25, uid]);
      break;
    case "XvnVwA_exercising":
      // copy 1010432:23
      UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid("1010436", 23, uid).then((copyResult)=>{
        console.log("copied batchId: " + batchId + " to: " + uid);
      }).catch((error)=>{
        LogManager.logError("Failed to copy stream object for uid: "+uid+", batchId: "+batchId, error);
      });
      // copy 1010432:24
      UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid("1010436", 24, uid).then((copyResult)=>{
        console.log("copied batchId: " + batchId + " to: " + uid);
      }).catch((error)=>{
        LogManager.logError("Failed to copy stream object for uid: "+uid+", batchId: "+batchId, error);
      });

      // copy 1010432:25 SIX HOURS
      var targetTimeSix = now + 60 * 60 * 6; // 6 hours
      if(env.name === 'development') {
        targetTimeSix = now + 60 * 1 * 2; // Dev one minute
      }
      JobManager.createJob(targetTimeSix, 'copyStreamObjectWithSourceUidIdToTargetUid', ["1010436", 25, uid]);

      // copy 1010432:26 TWELVE HOURS
      var targetTimeTwelve = now + 60 * 60 * 12; // 6 hours
      if(env.name === 'development') {
        targetTimeTwelve = now + 60 * 1 * 4; // Dev one minute
      }
      JobManager.createJob(targetTimeTwelve, 'copyStreamObjectWithSourceUidIdToTargetUid', ["1010436", 26, uid]);

      break;
    case "XvnVwA_finance":
      // copy 1010432:19
      UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid("1010437", 19, uid).then((copyResult)=>{
        console.log("copied batchId: " + batchId + " to: " + uid);
      }).catch((error)=>{
        LogManager.logError("Failed to copy stream object for uid: "+uid+", batchId: "+batchId, error);
      });

      // copy 1010432:20
      UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid("1010437", 20, uid).then((copyResult)=>{
        console.log("copied batchId: " + batchId + " to: " + uid);
      }).catch((error)=>{
        LogManager.logError("Failed to copy stream object for uid: "+uid+", batchId: "+batchId, error);
      });

      // copy 1010432:21 SIX HOURS
      var targetTimeSix = now + 60 * 60 * 6; // 6 hours
      if(env.name === 'development') {
        targetTimeSix = now + 60 * 1 * 2; // Dev one minute
      }
      JobManager.createJob(targetTimeSix, 'copyStreamObjectWithSourceUidIdToTargetUid', ["1010437", 21, uid]);

      // copy 1010432:22 TWELVE HOURS
      var targetTimeTwelve = now + 60 * 60 * 12; // 6 hours
      if(env.name === 'development') {
        targetTimeTwelve = now + 60 * 1 * 4; // Dev one minute
      }
      JobManager.createJob(targetTimeTwelve, 'copyStreamObjectWithSourceUidIdToTargetUid', ["1010437", 22, uid]);
      break;
  }
}
module.exports.handleBatchId = handleBatchId;

function addSwellistTipsByBatchId(uid, batchId, job, successCallback, failureCallback, completionCallback) {
  var tipIds = getTipIdsFromBatchId(batchId);
  async.eachSeries(tipIds, (tipId, callback)=>{
    var content = getTipContentFromTipId(tipId);
    if( !content ) {
      return callback();
    }
    content.uid = uid;
    addActivityStreamObjectWithContent(content).then((addData)=>{
      setTimeout(()=>{
        callback();
      }, 1001);
    }).catch((error)=>{
      callback(error);
    });
  }, (error) => {
    if( error ) {
      LogManager.logError("addSwellistTipsByBatchId failed.", error);
      return failureCallback(error);
    }
    if( successCallback ) {
      handleBatchSendNotifications(uid, batchId);
      successCallback(job, "Added stream objects for uid: "+ uid + ", batchId: " + batchId, completionCallback);
    }
  });
}
module.exports.addSwellistTipsByBatchId = addSwellistTipsByBatchId;

function copyStreamObjectWithSourceUidIdToTargetUid(sourceUid, sourceObjectId, targetUid, job, successCallback, failureCallback, completionCallback) {
  UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid(sourceUid, sourceObjectId, targetUid).then((copyResult)=>{
    successCallback(job, "Copied stream object to: " + targetUid, completionCallback);
  }).catch((error)=>{
    return failureCallback(error);
  });
}
module.exports.copyStreamObjectWithSourceUidIdToTargetUid = copyStreamObjectWithSourceUidIdToTargetUid;

function addSwellistTipById(uid, tipId, job, successCallback, failureCallback, completionCallback) {
  var content = getTipContentFromTipId(tipId);
  if( !content ) {
    if( failureCallback ) {
      failureCallback(job, new Error("Missing content"), completionCallback);
    }
    return;
  }
  content.uid = uid;
  addActivityStreamObjectWithContent(content).then((saveData)=>{
    if( successCallback ) {
      successCallback(job, "Added stream object.", completionCallback);
    }
  }).catch((error)=>{
    LogManager.logError("Failed to add acivity stream object with content for uid.", error);
    if( failureCallback ) {
      failureCallback(job, error, completionCallback);
    }
  });
}
module.exports.addSwellistTipById = addSwellistTipById;

function addActivityStreamObjectWithContent(content) {
  return new Promise((fulfill, reject)=>{
    UserActivityStreamManager.createUserActivityStreamObject(content).then((saveData)=>{
      fulfill(saveData);
    }, (error)=>{
      reject(error);
    });
  });
}

function getTipContentFromTipId(tipId) {
  if(templates[tipId]) {
    return templates[tipId];
  }
  var result;
  switch(tipId) {
    case "tipTile-signUp-shareGoals":
      result = {
                "type": "typeformQuiz",
                "quizId": "y57ngs",
                "title": "Share Your Goals With Us",
                "text": "We want to learn more about what you're working towards this month. Whether it's a specific goal, or maybe something larger that you haven't gotten around to yet, Swellist has your back. ",
                "buttonCopy": "Go",
                "name": "Share Goals",
                "images": [
                  {
                    "url": "http://static.swellist.com/images/feed/enter_tasks1.gif"
                  }
                ]
              };
      templates[tipId] = result;
      return result;
      break;
    case "tipTile-signUp-recipeMorelMushroom":
      result = {
                "link":"http://www.myrecipes.com/recipe/morel-mushroom-asparagus-saute",
                "type":"link",
                "title":"Recipe: Morel Mushroom and Asparagus Sauté",
                "text":"A healthy and delicious recipe that's easy to make, and perfect for springtime.",
                "framing":"Springtime recipes",
                "buttonText":"Go",
                "name":"Morel Mushroom and Asparagus Sauté",
                "images":[
                  {
                    "author":"Photo: Kang Kim; Styling: Jason Gledhill",
                    "width":300,
                    "height":300,
                    "title":"Photo: Kang Kim; Styling: Jason Gledhill",
                    "url":"http://cdn-image.myrecipes.com/sites/default/files/styles/300x300/public/image/recipes/ck/13/05/morel-mushroom-asparagus-saute-ck-x.jpg?itok=JU2zSgJi"
                  }
                ],
                "isLoading":false,
                "isSendChecked":false
              };
      templates[tipId] = result;
      return result;
      break;
    case "tipTile-signUp-trendingFitnessTips":
      result = {
        "link": 'http://www.livestrong.com/slideshow/553531-the-20-best-fitness-tips-of-all-time/',
        "type": 'link',
        "title": 'The 20 Best Fitness Tips of All Time',
        "text": 'You\'ve probably heard loads of exercise advice over the years, some of it likely conflicting from various trainers, TV shows and gym buddies. To clear things up, we sought out top fitness experts to get their take. We asked them for game-changing tips and proven difference makers shown to keep your body safe while burning fat and building muscle. Here are their top 20 tips.1. Trade Steady-State Cardio for Interval TrainingThe road to a leaner body isn\'t a long, slow march. It\'s bursts of high-intensity effort paired with slower, recovery efforts. Fifteen to 20 minutes of interval training performed like this can burn as many calories as an hour of traditional, steady-state cardio. And unlike the slow stuff, intervals can keep your body burning long after the workout ends.2. Brace Your Core Before Every ExerciseYour core is much more than a six-pack of muscles hiding beneath your gut -- it\'s a system of muscles that wraps around your entire torso, stabilizing your body, protecting your spine from injury and keeping you upright. Fire these muscles before every exercise to keep your back healthy, steady your balance and maintain a rigid body position. You\'ll get the added bonus of isometric exercise for your middle, which could reveal the muscles in your core you\'d like everyone to see.3. Trade Machine Exercises for Free WeightsMachines are built with a specific path the weight has to travel -- one that wasn\'t designed for you. If you\'re too tall, too short or your arms or legs aren\'t the same length, that fixed path won\'t match your physiology, and you\'ll increase the likelihood of injury and develop weaknesses. Trade your machine exercises for dumbbells, barbells and medicine balls to build strength in ways more specific to your body, while also working all the smaller stabilizing muscles that machines miss.4. Tuck Your Shoulder Blades Down and BackThis tip is great for chin-ups, but it\'s more than that. By sliding your shoulder blades down and back before an exercise -- like you\'re tucking them into your back pockets -- can improve your results and protect from injury. It helps activate your lats for pulling exercises, work your pecs more completely in pushing exercises, keeps your chest up during a squat and can reduce painful impingement on your rotator cuff during biceps curls.5. Increase Your Range of MotionAdd more work to each rep and increase the efficiency of your workout by increasing the range of motion -- the distance the main motion of the exercise travels to complete the rep. Squat deeper. Drop the weight until it\'s an inch or two above your chest. Raise the step for step-ups. Elevate your front or back foot on lunges. Get more from each move and your body will thank you.6. Explode Through Every RepThe "slow lifting" trend should be confined to the eccentric, or easier portion of any exercise. During the concentric portion, where you push, pull, press or jump, move the weight (or your body) as quickly as possible. Even if the weight doesn\'t move that fast, the intention of moving the weight quickly will turn on your fast-twitch muscle fibers, which will make your body more athletic and train it to use more fat as fuel.7. Use Multiple Joints With Every MoveSingle-joint exercises like biceps curls and triceps extensions will build your muscles, but slowly. Unless you\'re a bodybuilder with hours to spend in the gym, get more done in less time. Trade these inefficient moves for exercises that work multiple muscles and joints: Squats will build your legs and back, a bent-over row will build your biceps and your back, and a narrow-grip bench press will train your triceps while it sculpts your chest8. Mix Your Grip to Do More RepsIf your hands and forearms give out before your back or legs when doing deadlifts, chin ups, inverted rows or bent-over barbell rows, mix your grip. With one palm facing towards you and one facing away, grab the bar and do the exercise. For the next set, switch both hands. Keep alternating and you can rest your grip while working with the hand the opposite way, meaning your back and legs will determine when you\'re done with the set.9. Load One Side to Work Your CoreSince your core stabilizes your body, creating instability means it has to work that much harder. That means you can work your abs without ever doing a crunch. Here\'s how: Load one side of your body. Hold a weight on one shoulder during a lunge, press just one dumbbell overhead during a shoulder press, or perform a standing, single-arm cable chest press.10. Do Push-UpsThe pushup is one of the world\'s greatest exercises, and doing it with proper form is as simple as this cue: Maintain a rigid body line from the top of your head to your heels throughout the push. With this in mind, you won\'t sag your hips, hump your back, or bubble up your butt. Keep your elbows tucked in towards your sides as you lower your body, and push back up, strong as steel from head to heels.11. Lift Heavier WeightsPacking more weight on the bar won\'t make you "bulky." It will make you stronger and protect you from osteoporosis by increasing bone density. To get the greatest benefits, lift at least 60 to 70 percent of your one-rep maximum for each exercise. Instead of going for complicated calculations, choose a weight with which you can perform eight to 12 reps, with the last rep being a struggle but not impossible.14. Lift, Then RunIf you perform your strength training before your cardio work, you\'ll burn more fat while you pound the pavement. In a Japanese study, men who did the workout in this order burned twice as much fat as those who didn\'t lift at all.15. Run Hills to Burn Fat Faster and Reduce InjuryMore muscle means more results, and uphill running activates nine percent more muscle per stride than trotting at the same pace on level ground. It can also save your knees. Increasing the grade to just three percent can reduce the shock on your legs by up to 24 percent.16. Don\'t Stretch; Warm UpStatic stretching done just before activity can reduce your power output and increase your risk of certain injuries. Instead, perform an active warmup that gets your body ready for exercise with exercise, increasing your heart rate, firing up your nervous system and getting your muscles used to moving. For an easy routine, perform a five-minute warmup of basic, body weight moves -- lateral slides, pushups, squats and lunges.',
        "framing": 'Trending on Swellist: Fitness',
        "buttonText": 'Go',
        "name": 'UNIVERSAL TRENDING: The 20 Best Fitness Tips of All Time',
        "images":[{
          "width": 520,
          "height": 345,
          "url": 'http://img.aws.livestrongcdn.com/ls-slideshow-main-image/cme/photography.prod.demandstudios.com/8dc411c6-9ad4-453e-8c54-cc0e63e2bc96.jpg' }]
        }
      templates[tipId] = result;
      return result;
      break;
    case "tipTile-signUp-connectAccounts":
    case "tipTile-signUp-faq":
    case "tipTile-signUp-multiTasking":
    case "tipTile-signUp-tipsComing":
    case "tipTile-signUp-trendingBaileys":
    case "tipTile-signUp-trendingBecomeExpert":
    case "tipTile-signUp-trendingMarchMadness":
    case "tipTile-fitness-couchPotato":
    case "tipTile-fitness-diet":
    case "tipTile-fitness-homeYoga":
    case "tipTile-fitness-littleKnownTips":
    case "tipTile-fitness-nerd":
    case "tipTile-cooking-burritoBowls":
    case "tipTile-cooking-chickenQuinoa":
    case "tipTile-cooking-ingredientSubstitutions":
    case "tipTile-finance-apps":
    case "tipTile-finance-billsSkyrocketing":
    case "tipTile-finance-personalBudget":
    case "tipTile-makeTime-cellphoneOff":
    case "tipTile-makeTime-findTime":
    case "tipTile-makeTime-meditationTips":
    case "tipTile-makeTime-write":
    case "tipTile-organization-closetsDrawers":
    case "tipTile-organization-optimizingWorkspace":
    case "tipTile-organization-organizeLife":
    case "tipTile-organization-springCleaning":
    case "tipTile-timeManagement-gainMoreTime":
    case "tipTile-timeManagement-priorityMatrix":
    case "tipTile-timeManagement-takingBreaks":
    case "tipTile-timeManagement-workSmarter":
      var fileName = tipId + '.html';
      var filePath = require.resolve('../templates/html/'+fileName);
      var tipTile = fs.readFileSync(filePath, 'utf8');
      if( tipTile ) {
        result = getArticleObjectWithContentString( tipId, tipTile);
        templates[tipId] = result;
        return result;
      } else {
        var message = "Failed to read file: " + fileName;
        LogManager.logError(message, new Error(message));
        return null;
      }
      break;
    default:
      break;
  }
}

function getArticleObjectWithContentString(tipId, contentString) {
  return {
    type: "Article",
    name: tipId,
    mediaType: "text/html",
    content: contentString
  };
}

function getTipIdsFromBatchId(batchId) {
  switch(batchId) {
    case "signup_batch_1":
      return ["tipTile-signUp-connectAccounts", "tipTile-signUp-tipsComing"];
      break;
    case "signup_batch_2":
      return ["tipTile-signUp-trendingBecomeExpert",
              "tipTile-signUp-shareGoals",
              "tipTile-signUp-trendingFitnessTips"];
      break;
    case "signup_batch_3":
      return ["tipTile-signUp-faq",
              "tipTile-signUp-multiTasking",
              "tipTile-signUp-recipeMorelMushroom"];
      break;
    case "XvnVwA_making_time":
      return ["tipTile-makeTime-cellphoneOff",
              "tipTile-makeTime-findTime",
              "tipTile-makeTime-meditationTips",
              "tipTile-makeTime-write"]
      break;
    case "XvnVwA_managing_time":
    return ["tipTile-timeManagement-gainMoreTime",
            "tipTile-timeManagement-priorityMatrix",
            "tipTile-timeManagement-takingBreaks",
            "tipTile-timeManagement-workSmarter"]
            break;
    case "XvnVwA_exercising":
      return ["tipTile-fitness-nerd",
              "tipTile-fitness-diet",
              "tipTile-fitness-couchPotato",
              "tipTile-fitness-littleKnownTips",
              "tipTile-fitness-homeYoga"];
      break;
    case "XvnVwA_cooking":
    case "XvnVwA_health":
      return ["tipTile-cooking-burritoBowls",
              "tipTile-cooking-chickenQuinoa",
              "tipTile-cooking-ingredientSubstitutions"];
      break;
    case "XvnVwA_finance":
      return ["tipTile-finance-apps",
              "tipTile-finance-billsSkyrocketing",
              "tipTile-finance-personalBudget"];
      break;
    case "XvnVwA_organized":
    return ["tipTile-organization-closetsDrawers",
            "tipTile-organization-optimizingWorkspace",
            "tipTile-organization-organizeLife",
            "tipTile-organization-springCleaning"]
            break;
    default:
      LogManager.log("Missing tipIds for batchId: " +batchId, LogManager.LOG_LEVEL_ROLLBAR);
      return [];
  }
}

function handleBatchSendNotifications(uid, batchId) {
  switch(batchId) {
    default:
      break;
  }
}
