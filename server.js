/*
  Initiazation of socketio and server logic. Had to use express sessions since
  express and socketio seem to not be too happy together.
  TODO: How to identify user type? Cookie? Do we need to? No namespaces needed? Does it matter?
*/

/** Start server for E Tables*/
const app = require('./app');
const { PORT } = require("./config");
//const jwt = require("jsonwebtoken");

// app.listen(PORT, function () {
//   console.log(`Server starting on port ${PORT}!`);
// });
const http = require("http");
//const https = require("https");
const server = http.createServer(app);
// const cors = require("cors");
// app.use(cors());
// const expsession = require('express-session');
// const path = require('path');


//io.path('/socket.io');
const { Server } = require("socket.io");


const io = new Server(server,{
  cors:{
    origin:"http://localhost:3000"
  },
});

io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("customer:startOrder", () => {
      console.log("CUSTOMER STARTED AN ORDER");
    });
    socket.on("cook:markPending", () => {
      console.log("ORDER MARKED AS PENDING BY COOK");
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
});
// Here you export my socket.io to a global. Need to user req.app.get
app.set('io', io);

server.listen(PORT);
//module.exports = io;


/*
// initialize session middleware
const session = expsession({
  secret: 'random secret',
  saveUninitialized: true,
  resave: true
});

// function getcookie(req) {
//   var cookie = req.headers.cookie;
//   // usertype=someone; session=QyhYzXhkTZawIb5qSl3KKyPVN (this is my cookie i get)
//   return cookie.split('; ');
// }

const cookNamespace = io.of("/cook");
const customerNamespace = io.of("/customer");
app.set('cookNamespace',cookNamespace);
app.set('customerNamespace',customerNamespace);
// TODO: Need to globally get the user type somehow
var usertype = 'COOK';
// Middleware for checking if it's the correct user
cookNamespace.use((socket, next) => {
  console.log('Mid middleware at best')
  // ensure the user has sufficient rights
  // draw the cookie out, confirm that it's of correct type
  const req = socket.request;
  const res = socket.request.res;
    session(req, res, (err) => { 
        //next(err);
        //var cookie = getcookie(req);
        //console.log('Yummy cookie',cookie);
        //let token = req.query._token || req.body._token;
        //let { usertype } = jwt.decode(token);
        //let usertype = 'COOK';
        console.log(usertype)
        if(usertype === 'COOK' || usertype==='ADMIN'){
          req.session.save();
          next();
        }else{
          next(new Error("Not an authorized cook!" + err))
        }
    }) 
});

customerNamespace.use((socket, next) => {
  // ensure the user has sufficient rights
  // draw the cookie out, confirm that it's of correct type
  const req = socket.request;
  const res = socket.request.res;
    session(req, res, (err) => { 
        //next(err);
        //var cookie = getcookie(req);
        //console.log('Yummy cookie',cookie);
        //let token = req.query._token || req.body._token;
        //let { usertype } = jwt.decode(token);
        //let usertype = 'WAITSTAFF';
        if(usertype === 'CUSTOMER' || usertype === 'COOK'){
          req.session.save();
          next();
        }else{
          next(new Error("Not an authorized customer!"+ err))
        }
    }) 
});
cookNamespace.on("connection", socket => {
  // add emit events
  socket.on("cook:markPending", () => {
    console.log("ORDER MARKED AS PENDING BY COOK")
  });
  console.log("COOK connected");
});
customerNamespace.on("connection", socket => {
  // add emit events
  socket.on("customer:startOrder", () => {
    console.log("ORDER STARTED BY CUSTOMER");
  });
  console.log("CUSTOMER connected");
});
*/


// OLD SOCKETIO STUFF
//-------socketio stuff, may be helpful... or not
//const { Server } = require("socket.io");
//const http = require("http");
//const https = require("https");
//const server = http.createServer(app);

// const io = new Server(server,{
//   cors:{
//     origin:"http://localhost:3000",
//     methods:["GET","POST"],
//   },
// });
//-------
//open a socket here meaning that someone make an order 
//---------------testing
// io.on("connection", (socket) => {
//   console.log("New client connected");
//   // if (interval) {
//   //   clearInterval(interval);
//   // }
//   //interval = setInterval(() => getApiAndEmit(socket), 1000);
//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//     //clearInterval(interval);
//   });
// });
// app.set('socketio', io);//here you export my socket.io to a global

// const getApiAndEmit = socket => {
//   const response = new Date();
//   // Emitting a new message. Will be consumed by the client
//   socket.emit("FromAPI", response);
// };
//server.listen(PORT, () => console.log(`Listening on port ${PORT}`));


//module.exports = io;