/* 
  Routes for users. Basic login, signup, and other methods that arent really used yet.
  Should move the order history to orderRoutes.
*/
require('dotenv').config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");

const { ensureCorrectUser, authRequired, adminRequired } = require("../middleware/auth");

// const { io } = require("../server.js");
var app = require('express')();

const User = require("../models/user");
//const Order = require("../models/order");
const { validate } = require("jsonschema");

const { userSchema } = require("../schemas");

const createToken = require("../helpers/createToken");

/** GET / => {users: [user, ...]} */

router.get("/", authRequired, async function(req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username] => {user: user} */

// router.get("/:username", authRequired, async function(req, res, next) {
//   try {
//     const user = await User.findOne(req.params.username);
//     return res.json({ user });
//   } catch (err) {
//     return next(err);
//   }
// });

/** GET a single user by token */

router.get("/singleuser", authRequired, async function(req, res, next) {
  //get the token, read out the id, send that info back
  try {
    let token = req.query._token;
    let {username} = jwt.decode(token);
    const id = await User.findOne(username);
    return res.status(201).json({ id });
  } catch (err) {
    return next(err);
  }
});
/** POST / {userdata}  => {token: token} */

router.post("/", async function(req, res, next) {
  try {
    // let myJSON = JSON.stringify(req.body);
    // console.log(myJSON);
    delete req.body._token;
    //getting the google token and then deleteing it from the data so it can process normally
    //const gtoken = req.body.gtoken;
    //delete req.body.gtoken;
    const validation = validate(req.body, userSchema);

    // console.log(req.body);
    // console.log(validation.valid);
    //this should be moved to ENV variables page under SECRETE_KEY

    // secret_key = "6Ld6H48eAAAAABi8NJ-dHVybrRSd_tNBpo0JczwI";
    // const captchaCheck = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${gtoken}`;
    
    // async function tryGoogle(captchaCheck) {
    //   let resp = await axios.post(captchaCheck);
    //   //should return true if it's a valid user not a bot
    //   if(!resp.data.success){
    //     return next({
    //       status: 400,
    //       message: 'Youre a robot gtfooooooooooo'
    //     });
    //   }
    //   return resp;
    // }
    // tryGoogle(captchaCheck);
    
    //after the captcha is checked, make sure user is valid
    if (!validation.valid) {
      return next({
        status: 400,
        message: validation.errors.map(e => e.stack)
      });
    }
    //creating the token here, should have id in it now
    const newUser = await User.register(req.body);
    const {usertype} = newUser;
    console.log(usertype);
    // Need to set cookie so the socketio can identify the correct user.
    //res.cookie('usertype', usertype, {maxAge: 10800}).send('cookie set');
    /***** SOCKETIO: ON LOGIN SET THE NAMESPACE BASED OFF THE TYPE OF USER
      CUSTOMER NEEDS TO CONNECT TO WAITSTAFF AND COOK NAMESPACE
      COOK NEEDS TO CONNECT TO WAITSTAFF NAMESPACE ONLY
      WAITSTAFF NEEDS TO CONNECT TO CUSTOMER NAMESPACE ONLY
    *****/
    // if(usertype == 'CUSTOMER'){
    //   const waitstaffNamespace = io.of("/customer");
    //   const cookNamespace = io.of("/customer");

    //   waitstaffNamespace.on("connection", socket => {
    //     console.log("CUSTOMER connected");
    //   });
    //   cookNamespace.on("connection", socket => {
    //     console.log("CUSTOMER connected");
    //   });
    //   console.log("CUSTOMER connected");
    //   waitstaffNamespace.emit("hi I'm a CUSTOMER");
    //   cookNamespace.emit("hi I'm a CUSTOMER");

    // }else if(usertype == 'COOK'){
    //   const waitstaffNamespace = io.of("/waitstaff");

    //   waitstaffNamespace.on("connection", socket => {
    //     console.log("COOK connected");
    //   });
    //   console.log("COOK connected",socket.id);

    //   waitstaffNamespace.emit("hi I'm a COOK connected to WAITSTAFF namespace");
    // }else if(usertype == 'WAITSTAFF'){
    //   const customerNamespace = io.of("/customer");

    //   customerNamespace.on("connection", socket => {
    //     console.log("WAITSTAFF connected");
    //   });
    //   console.log("WAITSTAFF connected");

    //   customerNamespace.emit("hi I'm WAITSTAFF connected to CUSTOMER namspace");
    // }
    
    //const allinfo = User.findOne(username);
    //console.log(allinfo);
    //console.log(newUser);
    const token = createToken(newUser);
    //const token = createToken(allinfo);
    return res.status(201).json({ token });
  } catch (e) {
    return next(e);
  }
});


router.post("/adminregister",adminRequired, async function(req, res, next) {
  try {
    // let myJSON = JSON.stringify(req.body);
    // console.log(myJSON);
    let token = req.query._token;
    let {username} = jwt.decode(token);
    const validation = validate(req.body, userSchema);

    if (!validation.valid) {
      return next({
        status: 400,
        message: validation.errors.map(e => e.stack)
      });
    }
    //creating the token here, should have id in it now
    const newStaff = await User.adminRegister(req.body,username);

    //const token = createToken(newStaff);
    return res.status(201).json({ 'newtoken':'SUCCESS' });
  } catch (e) {
    return next(e);
  }
});
/** PATCH /[handle] {userData} => {user: updatedUser} */

// router.patch("/:username", ensureCorrectUser, async function(req, res, next) {
//   try {
//     if ("username" in req.body || "is_admin" in req.body) {
//       return next({ status: 400, message: "Not allowed" });
//     }
//     await User.authenticate({
//       username: req.params.username,
//       password: req.body.password
//     });
//     delete req.body.password;
//     const validation = validate(req.body, userUpdateSchema);
//     if (!validation.valid) {
//       return next({
//         status: 400,
//         message: validation.errors.map(e => e.stack)
//       });
//     }

//     const user = await User.update(req.params.username, req.body);
//     return res.json({ user });
//   } catch (err) {
//     return next(err);
//   }
// });

/** DELETE /[handle]  =>  {message: "User deleted"}  */

router.delete("/:username", ensureCorrectUser, async function(req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ message: "User deleted" });
  } catch (err) {
    return next(err);
  }
});

router.get("/orderhistory", authRequired, async function(req, res, next) {
  try {
    let token = req.query._token;
    let {username} = jwt.decode(token);
    const data = await User.orderHistory(username);
    return res.status(201).json({ data });
  } catch (err) {
    return next(err);
  }
});



module.exports = router;
