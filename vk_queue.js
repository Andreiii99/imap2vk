/**
 * Created by Андрей on 08.12.2015.
 */
var HashMap = require("hashmap");

/**
 *
 * @param period {number}
 * @param onTimer {Function}
 * @constructor
 */
var VkQueue = function (period, onTimer) {
    var hashMap = new HashMap();
    this.hashMap = hashMap;

    setInterval(function() {
        var keys =  hashMap.keys();
        for (var i =0; i<keys.length; i++) {
            var key = keys[i];
            var value = hashMap.get(key);
            var currTime = new Date().getTime();
            if (!value.in_process || (currTime - value.timestamp > 60*1000 /*retry after 1 minute */) ) {
                value.in_process = true;
                value.timestamp = currTime;
                onTimer(key, value.message);
                return; //try to send only one message per interval
            }
        }
    } , period);
};

VkQueue.prototype.add =  function(key, message) {
    this.hashMap.set(key, {message: message, in_process: false, timestamp: new Date().getTime()});
};

VkQueue.prototype.remove = function(key) {
    this.hashMap.remove(key);
};



module.exports = VkQueue;

