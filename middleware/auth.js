/* 
  Convenience middleware to handle common auth cases in routes. 
  Specific middleware to confirm type  COOK, WAITSTAFF, and ADMIN. 
  And to confirm that the user is logged in.
*/


const jwt = require("jsonwebtoken");
const {SECRET} = require("../config");


/** Middleware to use when they must provide a valid token.
 *
 * Add username onto req as a convenience for view functions.
 *
 * If not, raises Unauthorized.
 *
 */

function authRequired(req, res, next) {
  try {
    console.log(req.query._token) //here is where we get the token to do auth stuff
    const tokenStr = req.body._token || req.query._token;
    let token = jwt.verify(tokenStr, SECRET);
    req.username = token.username;
    return next();
  }

  catch (err) {
    let unauthorized = new Error("You must authenticate first.");
    unauthorized.status = 401;  // 401 Unauthorized
    return next(unauthorized);
  }
}

/** Middleware check that it's a cook
 *
 *
 * If not, raises Unauthorized.
 *
 */

function cookRequired(req, res, next) {
  try {
    console.log(req.query._token) //here is where we get the token to do auth stuff
    const tokenStr = req.body._token || req.query._token;
    let token = jwt.verify(tokenStr, SECRET);
    req.username = token.username;
    let userType = token.type;
    if(userType !== 'ADMIN' && userType !== 'COOK') throw new Error('Parameter is not a number!');
    return next();
  }

  catch (err) {
    let unauthorized = new Error("You're the wrong type of user to complete this action");
    unauthorized.status = 401;  // 401 Unauthorized
    return next(unauthorized);
  }
}

/** Middleware check that it's waitstaff
 *
 *
 * If not, raises Unauthorized.
 *
 */

function waitstaffRequired(req, res, next) {
  try {
    console.log(req.query._token) //here is where we get the token to do auth stuff
    const tokenStr = req.body._token || req.query._token;
    let token = jwt.verify(tokenStr, SECRET);
    req.username = token.username;
    let userType = token.type;
    if(userType !== 'ADMIN' && userType !== 'WAITSTAFF') throw new Error('Parameter is not a number!');
    return next();
  }

  catch (err) {
    let unauthorized = new Error("You're the wrong type of user to complete this action");
    unauthorized.status = 401;  // 401 Unauthorized
    return next(unauthorized);
  }
}

/** Middleware check that it's admin
 *
 *
 * If not, raises Unauthorized.
 *
 */

function adminRequired(req, res, next) {
  try {
    console.log(req.query._token) //here is where we get the token to do auth stuff
    const tokenStr = req.body._token || req.query._token;
    let token = jwt.verify(tokenStr, SECRET);
    req.username = token.username;
    let userType = token.type;
    if(userType !== 'ADMIN') throw new Error('idk');
    return next();
  }

  catch (err) {
    let unauthorized = new Error("You're the wrong type of user to complete this action");
    unauthorized.status = 401;  // 401 Unauthorized
    return next(unauthorized);
  }
}

/** Middleware to use when they must provide a valid token that is an admin token.
 *
 * Add username onto req as a convenience for view functions.
 *
 * If not, raises Unauthorized.
 *
 */

// function adminRequired(req, res, next) {
//   try {
//     const tokenStr = req.body._token || req.query._token;
//     let token = jwt.verify(tokenStr, SECRET);
    
//     req.username = token.username;
//     if(token.username=="debAdmin" || token.username=="hannahAdmin" || token.username=="maddyAdmin" || token.username=="devAdmin"){
//       return next();
//     }
//     // if (token.is_admin) {
//     //   return next();
//     // }
//     // throw an error, so we catch it in our catch, below
//     throw new Error();
//   }

//   catch (err) {
//     const unauthorized = new Error("You must be an admin to access.");
//     unauthorized.status = 401;

//     return next(unauthorized);
//   }
// }


/** Middleware to use when they must provide a valid token & be user matching
 *  username provided as route param.
 *
 * Add username onto req as a convenience for view functions.
 *
 * If not, raises Unauthorized.
 *
 */

function ensureCorrectUser(req, res, next) {
  try {
    const tokenStr = req.body._token || req.query._token;

    let token = jwt.verify(tokenStr, SECRET);
    req.username = token.username;

    if (token.username === req.params.username) {
      return next();
    }

    // throw an error, so we catch it in our catch, below
    throw new Error();
  }

  catch (e) {
    const unauthorized = new Error("You are not authorized.");
    unauthorized.status = 401;

    return next(unauthorized);
  }
}

//adminRequired,
module.exports = {
  authRequired,
  cookRequired,
  waitstaffRequired,
  adminRequired,
  ensureCorrectUser,
};
