/*
  ...Creates token
*/
const jwt = require("jsonwebtoken");
const { SECRET } = require("../config");


/** return signed JWT from user data. */

function createToken(user) {
  let payload = {
    username: user.username,
    email:user.email,
    firstname:user.firstname,
    lastname:user.lastname,
    type:user.usertype
  };

  return jwt.sign(payload, SECRET);
}


module.exports = createToken;