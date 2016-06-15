var room = require(__dirname+'/room');
var lobby = function(){
    var lobby = {};

    lobby.rooms = {};

    lobby.createRoom = function(roomData){
        var newRoom = room(roomData);
        lobby.rooms[newRoom.id] = newRoom;
        return newRoom;
    };

    lobby.deleteRoom = function(roomID){
        delete lobby.rooms[roomID];
    }

    lobby.getRoom = function(roomID){
        return (lobby.rooms.hasOwnProperty(roomID)) ? lobby.rooms[roomID]: false;
    }

    return lobby;
}

module.exports = lobby();