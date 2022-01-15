const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');

app.use(express.static('./public'));

const server = http.createServer(app);
const io = require('socket.io')(server);

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const IPs = {};
const socketId = {};

io.on('connection', function(socket){
  var address = socket.handshake.address;
  console.log(' > new connection < ' + address + ' cID: ' + socket.id);
  if(!IPs[address]) IPs[address] = socket.id;

  socket.on('updateName', function(data){
    socketId[socket.id] = data.substring(0, 16);
  });
  socket.on('attack', function(data){
    const x = Object.keys(socketId);
    if(x.length > 1){
      let k = Math.floor(Math.random()*(x.length-1));
      if(x[k] == socket.id) k = x-1;

      io.to(x[k]).emit('receive', data);
    }
  });
  socket.on('disconnect', function(reason){


    delete IPs[address];
    delete socketId[socket.id];
    // room.disconnect(socket.id, reason);
  });
});

server.listen(process.env.PORT || 3000, '0.0.0.0', function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  console.log(`Running at ${(1e3/Math.round(1e3 / config.targetFrameRate)).toFixed(2)}FPS`);
});
