### Simple Game Lobby Server

provides host with the ability to register games.  
retrieve information about a game (number of players players etc)  
and join/remove players

| Requests      | Params                 | Action                                              |  return |
| :------------- |:-------------------   | :--------------------------------------------------| :-------|
| createRoom    | pageNumber,roomDesc    | creates room using ip of request as host| {roomID}|
| getRoom       | roomID                 | retrieves room information|{roomID: {roomName, roomDesc, hostIP, playerCount}}|
| leaveRoom     | roomID                 | -1 player count from room & removes room if empty| **none**
| joinRoom      | roomID                 | +1 player | {hostIP,roomName,roomDesc,playerCount} |
| deleteRoom    | roomID                 | deletes room                                        | **none**|

