// * Import
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
require('./db_connection/db')();
const server = require('http').createServer(app);
const {socketIo} = require('./io/io')
const io = socketIo(server, { cors: { origin: "*" } });
const session = require('express-session')
require('dotenv').config()
const amqp = require("amqplib/callback_api");
var mqconn;

const expressLayouts = require('express-ejs-layouts');
const chatRouter = require('./routes/chat'); 
const loginRouter = require('./routes/login'); 
const registerRouter = require('./routes/register'); 
const homeRouter = require('./routes/home'); 
const oprationRouter = require('./routes/opration');
const messageRouter = require('./routes/message');


app.use(session(JSON.parse(process.env.SESS)))
app.use(express.json());
const urlencodedParser = bodyParser.urlencoded({ extended :true })
app.use(express.urlencoded({ extended : true}));
const port = process.env.PORT || 8100;
const url = `https://chatappic.herokuapp.com`



// * static file
app.use(express.static('public'));
app.use('./css', express.static(url +'public/css'));
app.use('/img', express.static(url + 'public/img'));

// * set Templating Engine
app.use(expressLayouts);
app.set('layout', './layouts/chat')
app.set('view engine', 'ejs')

// * Navigation (Routes)
app.use('/', homeRouter);
app.use('/chat', urlencodedParser, chatRouter);
app.use('/login', urlencodedParser, loginRouter);
app.use('/register', urlencodedParser, registerRouter);
app.use('/', urlencodedParser, oprationRouter);
app.use('/message', urlencodedParser, messageRouter);








io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);

  socket.on('whichFriendIsOnline',data=>{
    io.emit('iAmOnline', data)
  })
  socket.on('friendIsOnline', data=>{
    socket.userid = data
    io.emit('friendOnlinestatus',data)
  })
  socket.on('disconnect', ()=>{
    io.emit('friendOfflinestatus', socket.userid)
  })
  socket.on('joinRoom', (roomName)=>{
    socket.join(roomName);
  })
  socket.on('sendMessage', (data)=>{

    socket.to(data.roomId).emit("newMessage", data);
  })
  socket.on('leaveRoom', roomName=>{
    socket.leave(roomName, socket.id);
  })
  
  socket.on('joinGroupRoom', (groupRoomName)=>{
    socket.join(groupRoomName);
  })
  socket.on('leaveGroupRoom', groupRoomName=>{
    socket.leave(groupRoomName, socket.id);
  })
  
  socket.on('sendMessageOnGroup', (data)=>{
    socket.to(data.roomID).emit("newMessage", data);
  })
});

// TODO Listening port
server.listen(port, () => console.info(`\u001b[33m Server started on port, \u001b[31m http://localhost:${port} \u001b[37m`));
module.exports = url;
