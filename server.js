'use strict';



let app = require('express')();

let http = require('http').Server(app);

let io = require('socket.io')(http);


setInterval(function() {
  var data = {
    app: 3,
    pdr: "Amazon",
    svc: "EC2",
    svr: Math.floor(Math.random() * 100)
  }
  io.emit('data', data);
}, 1000)

io.on('connection', (socket) => {

  console.log('USER CONNECTED');

  socket.on('disconnect', function(){

    console.log('USER DISCONNECTED');

  });


});



http.listen(8080, () => {

  console.log('started on port 8080');

});
