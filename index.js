var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var getIP = require('ipware')().get_ip;
var _ = require('lodash');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));

var room = require(__dirname+'/private/room');
var lobby = require(__dirname+'/private/lobby');

//number of rooms displayed per page on listRooms
var ROOMS_PER_PAGE = 10;
//time to live for a room, if no player joins within time limit then room is destroyed
var ROOM_TTL = 1000*60*5;

//when a room is created a timer object is added to activeRooms , each time someone joins the room the timer is reset
//if it reaches max time then room is cleared from the lobby
var activeRooms = {};

app.get('/createRoom', function(req, res) {
  var hostIP = getIP(req).clientIp;
  var roomName = req.query.roomName;
  var roomDesc = req.query.roomDesc;

  var newRoom = lobby.createRoom({
    "roomName": roomName,
    "roomDesc": roomDesc,
    "hostIP": hostIP
  });

  if (newRoom){
    addTimer(newRoom.id);
    res.status = 200;
    res.json({
      "roomID": newRoom.id
    });
  } else {
    res.status = 500;
    res.send("an error has occured");
  }
});

app.get('/listRooms', function(req,res){
  var pageNumber = req.query.pageNum;
  var roomKeys = Object.keys(lobby.rooms).splice(pageNumber*ROOMS_PER_PAGE,ROOMS_PER_PAGE);
  var roomsRequested = {};
  //return a json file of [roomID: roomName]
  _.each(roomKeys, function(rID){
      var cRoom = lobby.rooms[rID];
      roomsRequested[rID] = {
        "roomName": cRoom.roomName,
        "roomDesc": cRoom.description,
        "hostIP": cRoom.host,
        "playerCount": cRoom.playerCount
      }
  });
  res.json(roomsRequested);
});

app.get('/getRoom', function(req,res){
  var roomID = req.query.roomID;
  var room = lobby.getRoom(roomID);
  if (room){
    res.json({
      "hostIP": room.host,
      "roomName": room.roomName,
      "playerCount": room.playerCount,
      "roomDesc": room.description
    });
  } else {
    res.status = 500;
    res.send("room no longer exists");
  }
});

app.get('/leaveRoom', function(req,res){
  var roomID = req.query.roomID;
  var room = lobby.getRoom(roomID);

  if (room){
    room.removeUser();
    if (room.isEmpty()){
      lobby.deleteRoom(roomID);
      removeTimer(roomID);
    }
    res.status = 200;
    res.send("player has left room");
  } else {
    res.status = 500;
    res.send("error leaving room");
  }

});

app.get('/joinRoom', function(req,res){
  var roomID = req.query.roomID;
  var room = lobby.getRoom(roomID);
  if (room){
    var completed = room.addUser();
    if (completed){
      resetTimer(roomID);
      res.status = 200;
      res.json({
        "hostIP": room.host,
        "roomName": room.roomName,
        "playerCount": room.playerCount,
        "roomDesc": room.description
      });
    }
    //room is full
    else {
      res.status = 500;
      res.send("room is full");
    }
  }
   else {
    res.status = 500;
    res.send("error adding player");
  }
});

app.get('/deleteRoom', function(req,res) {
  var roomID = req.query.roomID;
  var room = lobby.getRoom(roomID);
  if (room){
    lobby.deleteRoom(roomID);
    removeTimer(roomID);
    res.status = 200;
    res.send("room succesfully deleted");
  } else {
    res.status = 500;
    res.send("error deleting room");
  }
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})


///Deal with cleanup of inactive servers
function addTimer(roomID){
  if (activeRooms.hasOwnProperty(roomID)){
    console.log("trying to add timer where timer exists");
    return false;
  }
  activeRooms[roomID] = setTimeout(function(){
    console.log("room deleted:", roomID);
    lobby.deleteRoom(roomID);
  }, ROOM_TTL);
};

function removeTimer(roomID){
  if (activeRooms.hasOwnProperty(roomID)){
    clearTimeout(activeRooms[roomID]);
    delete activeRooms[roomID];
  }
};

function resetTimer(roomID){
  removeTimer(roomID);
  addTimer(roomID);
};
