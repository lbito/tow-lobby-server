var shortid = require('shortid');

var room = function(roomData){
    var r = {};
    r.roomName = roomData.roomName;
    r.id = shortid.generate();
    r.host = roomData.hostIP;
    r.description = roomData.roomDesc;
    r.playerCount = 1;
    r.maxUsers = 12;

    r.addUser = function(){
        if (r.playerCount < r.maxUsers){
            r.playerCount++;
            return true;
        }
        return false;
    }

    r.removeUser = function (){
        r.playerCount --;
        return (r.playerCount !== 0);
    }

    r.isEmpty = function(){return r.playerCount === 0};

    return r;
}

module.exports = room;