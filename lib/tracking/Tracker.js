
class Tracker {
  constructor(options) {
    if(options.mixpanel) {
      this.mixpanel = options.mixpanel;
    }
    if(options.apiUtils) {
      this.apiUtils = options.apiUtils;
      this.eventQueue = [];
    }

    this.eventQueueFlushId = setInterval(()=>{
      if(this.eventQueue.length) {
        this.apiUtils.trackBatch(this.eventQueue.slice());
        this.eventQueue = [];
      }
    }, 5000);
  }

  track(event, properties) {
    if(!event) {
      return;
    }
    if(!properties) {
      properties = {};
    }
    if(this.mixpanel) {
      this.mixpanel.track(event, Object.assign({}, properties));
    }
    if(this.apiUtils) {
      this.eventQueue.push({"event": event, "properties": properties});
      // this.apiUtils.track(event, properties);
    }
  }
}

module.exports = Tracker;
