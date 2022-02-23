const path = require('path');
const express = require('express'); 
const http = require('http');
const socketio = require('socket.io');
const goodFilter = require('bad-words');
const {addUser, removeUser, getUser, getAllUsersInRoom} = require('./utils/users')

const {generateMessageBundle, generateLocationBundle} = require('./utils/messageBundle.js');
const app = express();
const server = http.createServer(app);
const io = socketio(server); // socket.io requires the raw server to be passed on to it.

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));


io.on('connection', (socket)=>{
  console.log("New web socket connection !");

  
  socket.on('join', (options, callback)=>{ // options contains {username, room}
    const {error, user} = addUser({ id: socket.id, ...options}); // add user is programmed to return an object either with an user property or an error prop.

    if(error){
     return callback(error);
    }
    
    socket.join(user.room); // have to learn more abt this

      socket.emit('message',generateMessageBundle('ROBOT', 'Welcome CHATTY!') );
      socket.broadcast.to(user.room).emit('message', generateMessageBundle('ROBOT',`${user.username} has joined the chat!`));//broadcasting except the new joined user!
      io.to(user.room).emit('roomList',{
        room : user.room,
        users : getAllUsersInRoom(user.room)
      })
      callback();

      //socket.emit, io.emit, socket.broadcast.emit
      //io.to.emit, socket.broadcast.to.emit (to => limited to a particular socket room!)
  })

  socket.on('fromClient', (message, callback)=>{
    
    const user = getUser(socket.id);

    const filter = new goodFilter();
    if(filter.isProfane(message)){
      return callback('Profanity is not allowed!');
    }
    
    io.to(user.room).emit('message', generateMessageBundle(user.username,  message));// broadcasting including the current sender and all
   callback("Delivered!");
  });

  socket.on('sendLocation', (locationData, callback)=>{
    const user = getUser(socket.id);

    io.to(user.room).emit('locationMessage', generateLocationBundle(user.username, `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`));
    callback();//if an argument is passed inside, then the callback thiks that as an error message!
  })

  socket.on('disconnect',()=>{

    const removedUser = removeUser(socket.id); // the socket itself provides the id field for every user

    if(removedUser){
    io.to(removedUser.room).emit('message', generateMessageBundle('ROBOT',  `${removedUser.username} has left!`));
      io.to(removedUser.room).emit('roomList', {
        room : removedUser.room,
        users : getAllUsersInRoom(removedUser.room)
      })
  } 

  });
})

server.listen(port, ()=>{ // app inside server
  console.log(`SERVER UP ON ${port}!`);
})