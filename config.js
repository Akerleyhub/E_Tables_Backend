/** Shared config for application; can be req'd many places. */


require("dotenv").config();
//I dont remember what this secret key was meant for..
const SECRET = process.env.SECRET_KEY || 'test';

const PORT = +process.env.PORT || 3001;

// database is:
//
// - on Heroku, get from env var DATABASE_URL

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "etables-test";
} else {
  DB_URI  = process.env.DATABASE_URL || 'etables';
}

console.log("Using database", DB_URI);

module.exports = {
  SECRET,
  PORT,
  DB_URI,
};