"use strict";

var _ = require('underscore')
    ;

class ActivityStream {
    constructor(streamData) {
      if(streamData.orderedItems) {
        var filteredStream = [];
        for(let streamObject of streamData.orderedItems) {
          if(streamObject.hasOwnProperty('deletedAt') && typeof streamObject.deletedAt === 'number' ) {
            // means it was actually deleted.
          } else {
            filteredStream.push(streamObject);
          }
        }
        streamData.orderedItems = filteredStream;
      }
      this.attributes = streamData;
    }

    /**
     * Adds a new stream object to the top of the stack.
     * @param streamObject
     */
    addNewStreamObject(streamObject) {
      this.attributes.orderedItems.unshift(streamObject);
    }

    removeStreamObject(streamObject) {
        var result = [];
        var streamObjects = this.attributes.orderedItems;
        for( var i = 0; i<streamObjects.length; i++ ){
            var curStreamObject = streamObjects[i];
            if( streamObject.uid == curStreamObject.uid && streamObject.id == curStreamObject.id ) {
                console.log("removed");
            } else {
                result.push(curStreamObject);
            }
        }

        this.attributes.orderedItems = null;
        var streamData = {};
        streamData.orderedItems = result;
        this.attributes = streamData;
    }

    get JSON() {
        var result = this.attributes;
        result.orderedItems = this.attributes.orderedItems;
        return result;
    }

    get attributes() {
        if( !this._attributes ) {
            return {};
        }
        return Object.assign({}, this._attributes);
    }

    set attributes(metaData) {
        this._attributes = metaData;
    }

    get streamObjects() {
      var result = this.attributes.orderedItems;
      if(!result) {
          result = [];
      }
      return result;
    }

    set streamObjects(streamObjects) {
        if( !(streamObjects instanceof Array) ) {
            throw new Error("Trying to set stream objects to a non-array.");
        }
        if(!this.attributes) {
            this.attributes = {};
        }
        this.attributes.orderedItems = streamObjects;
    }
}

module.exports = ActivityStream;
