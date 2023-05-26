/* 
  Routes for authentication. Only login logic. Goes into user route.
*/

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const createToken = require("../helpers/createToken");


router.post("/login", async function(req, res, next) {
  try {
    const user = await User.authenticate(req.body);
    // const {usertype} = user;
    // console.log(usertype,':type');

    const token = createToken(user);
    return res.json({ token });
  } catch (e) {
    return next(e);
  }
});


module.exports = router;