/*
  SQL express logic for handling user route functions.
*/
const db = require("../db");
const bcrypt = require("bcrypt");
//const partialUpdate = require("../helpers/partialUpdate");

const BCRYPT_WORK_FACTOR = 10;


/** Related functions for users. */

class User {

  /** authenticate user with username, password. Returns user or throws err. */

  static async authenticate(data) {
    // try to find the user first
    const result = await db.query(
        `SELECT username, 
                password, 
                firstname, 
                lastname, 
                email,
                usertype
          FROM users 
          WHERE email = $1`,
        [data.email]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(data.password, user.password);
      if (isValid) {
        return user;
      }
    }

    const invalidPass = new Error("Invalid Credentials");
    invalidPass.status = 401;
    throw invalidPass;
  }

  /** Register user with data. Returns new user data. */

  static async register(data) {
    const duplicateCheck = await db.query(
        `SELECT username 
            FROM users 
            WHERE username = $1`,
        [data.username]
    );

    if (duplicateCheck.rows[0]) {
      const err = new Error(
          `There already exists a user with username '${data.username}`);
      err.status = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
        `INSERT INTO users 
            (username, password, firstname, lastname,usertype, email) 
          VALUES ($1, $2, $3, $4, $5, $6) 
          RETURNING username, password, firstname, lastname,usertype, email`,
        [
          data.username,
          hashedPassword,
          data.firstname,
          data.lastname,
          data.type,
          data.email
        ]);
    //let usname = result.rows[0].username;
    //const fullres = await db.query(`SELECT * FROM users WHERE username=${usname}`);
    //console.log(fullres);
    return result.rows[0];
  }

  /** Register user with data. Returns new user data. */

  static async adminRegister(data,user) {
    const duplicateCheck = await db.query(
        `SELECT username 
            FROM users 
            WHERE username = $1`,
        [data.username]
    );

    if (duplicateCheck.rows[0]) {
      const err = new Error(
          `There already exists a user with username '${data.username}`);
      err.status = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    const business = await db.query(`SELECT fk_businessid FROM USERS WHERE username=$1`,[user]);

    const result = await db.query(
        `INSERT INTO users 
            (username, password, firstname, lastname,usertype, email,fk_businessid) 
          VALUES ($1, $2, $3, $4, $5, $6, $7) 
          RETURNING username, password, firstname, lastname,usertype, email, fk_businessid`,
        [
          data.username,
          hashedPassword,
          data.firstname,
          data.lastname,
          data.type,
          data.email,
          business.rows[0].fk_businessid
        ]);

    return result.rows[0];
  }

  /** Find all users. */

  static async findAll() {
    const result = await db.query(
        `SELECT username, firstname, lastname, email
          FROM users
          ORDER BY username`);

    return result.rows;
  }

  /** Given a username, return data about user. */

  static async findOne(username) {
    const userRes = await db.query(
        `SELECT customerid,username, firstname, lastname, email
            FROM users
            WHERE username = $1`,
        [username]);

    if (!userRes) {
      const error = new Error(`There exists no user '${username}'`);
      error.status = 404;   // 404 NOT FOUND
      throw error;
    }
    //console.log(userRes.rows[0],"in the user db")
    return userRes.rows[0].customerid;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Return data for changed user.
   *
   */

  // static async update(username, data) {
  //   if (data.password) {
  //     data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
  //   }

  //   let {query, values} = partialUpdate(
  //       "users",
  //       data,
  //       "username",
  //       username
  //   );

  //   const result = await db.query(query, values);
  //   const user = result.rows[0];

  //   if (!user) {
  //     let notFound = new Error(`There exists no user '${username}`);
  //     notFound.status = 404;
  //     throw notFound;
  //   }

  //   delete user.password;
  //   delete user.is_admin;

  //   return result.rows[0];
  // }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
      let result = await db.query(
              `DELETE FROM users 
                WHERE username = $1
                RETURNING username`,
              [username]);

    if (result.rows.length === 0) {
      let notFound = new Error(`There exists no user '${username}'`);
      notFound.status = 404;
      throw notFound;
    }
  }

    /** Get Users Order History */
    //https://stackoverflow.com/questions/3395339/sql-how-do-i-query-a-many-to-many-relationship
    static async orderHistory(username) {
      const userid = await db.query(`select id from users where username = $1`,[username]);

      const result = await db.query(
          `SELECT i.name,i.cost,i.description
          FROM items i
          JOIN order_item oi ON oi.item_id = i.id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.fk_customerid=$1
          ORDER BY o.orderdatetime
          LIMIT 5`,[userid.rows[0].id]);
  
      return result.rows;
    }
}


module.exports = User;
