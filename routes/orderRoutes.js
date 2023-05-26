/* 
    Routes for orders. Has bulk of the important app logic.
    Does emit socketio events. 
    Be aware that Cook, Waitstaff models are being called in here as well. 
    Most are order model though.
*/


const express = require("express");
const router = express.Router();
//, adminRequired 
const { ensureCorrectUser, authRequired,cookRequired,waitstaffRequired,adminRequired} = require("../middleware/auth");
const jwt = require("jsonwebtoken");
//const app = require('../app');
const Order = require("../models/order");
const Cook = require("../models/cook");
const WaitStaff = require("../models/waitstaff");
//const QRCode = require('qrcode');
//const nodemailer = require("nodemailer");

//const User = require("../schemas/EmailLog.json");
const { user } = require("../db");
//const io = require("../server");


router.post('/getMenu', authRequired, async function(req,res,next){
        try {
            //console.log(req.body);
            //console.log(req.headers);
            const menu = await Order.getMenu(req.body);
            //console.log(getQR);
            return res.status(201).json(menu);
        }catch (e) {
            return next(e);
        }
})

//Here is where I handle adding the cart order to the db-----------------
router.post('/addOrder', authRequired, async function(req,res,next){
    try {
        let token = req.query._token;
        let { username } = jwt.decode(token);
        const newOrder = await Order.addOrder(req.body,username);

        // This will refresh the Cook's page on client-side
        let socketio = req.app.get('io');
        socketio.emit("customer:startOrder");
        // let customerNamespace = req.app.get('customerNamespace');
        // customerNamespace.emit("customer:startOrder");

        return res.status(201).json(newOrder)
        //return res.status(201).json({ "itwork":"order added" });
    }catch (e) {
      return next(e);
    }
});
// Primary get for cook
router.get('/getOrders', authRequired, async function(req,res,next){
    try {
        let token = req.query._token;
        let { username } = jwt.decode(token);
        const orders = await Cook.getOrders(username);
        
        return res.status(201).json(orders)
    }catch (e) {
      return next(e);
    }
});
// Primary get for waitstaff
router.get('/getCookedOrders', authRequired, async function(req,res,next){
    try {
        let token = req.query._token;
        let { username } = jwt.decode(token);
        const orders = await WaitStaff.getOrders(username);
        
        return res.status(201).json(orders)
    }catch (e) {
      return next(e);
    }
});
// Cook version of isDone
router.post('/markPending', cookRequired, async function(req,res,next){
    try {
        const marked = await Cook.markPending(req.body);
        
        // This will refresh the wait staff page
        let socketio = req.app.get('io');
        socketio.emit("cook:markPending");
        // let cookNamespace = app.get('cookNamespace');
        // cookNamespace.emit("cook:markPending");

        return res.status(201).json(marked)
        //return res.status(201).json({ "itwork":"order added" });
    }catch (e) {
      return next(e);
    }
});
// Waitstaff overall isDone
router.post('/markComplete', waitstaffRequired, async function(req,res,next){
    try {
        const completed = await WaitStaff.markComplete(req.body);
        // Dont need an event here bc when it's done it's done
        return res.status(201).json(completed)
        //return res.status(201).json({ "itwork":"order added" });
    }catch (e) {
      return next(e);
    }
});
// router.post('/addOrderItems', authRequired, async function(req,res,next){
//     try {
//         //const newOrder = await Order.addOrder(req.body);
//         const orderitems = await Order.addOrderItems(req.body);
//         return res.status(201).json({ "itwork":"order items added" });
//     }catch (e) {
//         return next(e);
//     }
// });

// router.get('/getQRcode', authRequired, async function(req,res,next){
//     try {
//         const getQR = await Order.getQRcode();
//         //console.log(getQR);
//         return res.status(201).json(getQR);
//     }catch (e) {
//         return next(e);
//     }
// })

// router.post('/sendQRemail',authRequired,async function(req,res,next){
//     //generating the QRCode img
//     console.log("SENDING ORDER EMAIL NOW");
//     //sending a message to admin route to say that a new order has been made
//     // const { Server } = require("socket.io");
//     // const io = new Server(server);
//     const io = req.app.get('socketio'); //Here you use the exported socketio module
//     io.emit('order up!', 'something was ordered!!!');
//     let data = jwt.decode(req.query._token);
//     let email = data.email;

//     const generateQR = async() => {
//       try{
//         const getQR = await Order.getQRcode();
//         return getQR;
//       }catch (e) {
//         return next(e);
//       }
//     }
//     let text = await generateQR();
//     var img = await QRCode.toDataURL(text);
    // Create sendEmail params 
//     var params = {
//       Destination: { /* required */
//         ToAddresses: [
//           email,
//           /* more items */
//         ]
//       },
//       Message: { /* required */
//         Body: { /* required */
//           Html: {
//           Charset: "UTF-8",
//           Data: "HTML_FORMAT_BODY"
//           },
//           Text: {
//           Charset: "UTF-8",
//           Data: "Thank you for your order"
//           }
//         },
//         Subject: {
//           Charset: 'UTF-8',
//           Data: 'Test email subject'
//         }
//         },
//       Source: 'BarnCorinth@gmail.com', /* required */
//       ReplyToAddresses: [
//         'EMAIL_ADDRESS',
//         /* more items */
//       ],
// };

// // Create the promise and SES service object
// var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

// // Handle promise's fulfilled/rejected states
// sendPromise.then(
//   function(data) {
//     console.log(data.MessageId);
//   }).catch(
//     function(err) {
//     console.error(err, err.stack);
//   });

//makes it so only an admin will be able to get and mark orders from the page w middleware
/*
router.get('/undoneorders', adminRequired ,async function(req,res,next){
    try {
        const getOrders = await Order.getOrders();
        //console.log(getOrders);
        return res.status(201).json(getOrders);
    }catch (e) {
        return next(e);
    }
})

//takes orders off the admin page by marking them as done
router.patch('/finishorder', adminRequired,async function(req,res,next){
  try {
      //console.log(req.body)
      const rmOrders = await Order.removeOrders(req.body);
      return res.status(201).json(rmOrders);
  }catch (e) {
      return next(e);
  }
})
*/

module.exports = router;