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
    delete req.body._token;
    const validation = validate(req.body, userSchema);

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
    /
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
