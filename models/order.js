/* 
    Most of this logic wont be recycleable 
    keeping as a placeholder in case idk what to do.
    Getmenu and Addmenu are in here. Which do as you expect.
    TODO: Figure out how to batch orders. Could prob refractor getMenu. 
*/
const db = require("../db");


class Order{
    // Need businessid and tableid to identify what table to return
    static async getMenu(tableInfo)
    {
        //console.log(tableInfo)
        const {businessid,tableid,filter} = tableInfo;
        const tid= parseInt(tableid);

        let menu_id = await db.query(`SELECT fk_menuid FROM location WHERE id=$1`,[tid]);

        var food,drink;
        if(filter === '*'){
            food = await db.query(`SELECT i.id,i.name,i.cost,i.description,i.foodordrink,i.itemtype,i.itemimage
                FROM items i
                JOIN menu_item mi ON mi.item_id = i.id
                JOIN menus m ON mi.menu_id = m.id
                WHERE m.id=$1 and i.foodordrink='food'`,[menu_id.rows[0].fk_menuid]);
            //console.log('food',food.rows);
            drink = await db.query(`SELECT i.id,i.name,i.cost,i.description,i.foodordrink,i.itemtype,i.itemimage
                FROM items i
                JOIN menu_item mi ON mi.item_id = i.id
                JOIN menus m ON mi.menu_id = m.id
                WHERE m.id=$1 and i.foodordrink='drink'`,[menu_id.rows[0].fk_menuid]);
        }else{
            food = await db.query(`SELECT i.id,i.name,i.cost,i.description,i.foodordrink,i.itemtype,i.itemimage
                FROM items i
                JOIN menu_item mi ON mi.item_id = i.id
                JOIN menus m ON mi.menu_id = m.id
                WHERE m.id=$1 and i.foodordrink='food' and i.itemtype = $2`,[menu_id.rows[0].fk_menuid,filter]);
            //console.log('food',food.rows);
            drink = await db.query(`SELECT i.id,i.name,i.cost,i.description,i.foodordrink,i.itemtype,i.itemimage
                FROM items i
                JOIN menu_item mi ON mi.item_id = i.id
                JOIN menus m ON mi.menu_id = m.id
                WHERE m.id=$1 and i.foodordrink='drink' and i.itemtype = $2`,[menu_id.rows[0].fk_menuid,filter]);
        }
        

        //console.log(m.rows[0]);
        return [...food.rows,...drink.rows]; //think I can just not filter and return rows instead of whatever this is
    }
    // Going to need to add into Location, Order, and Orderitem table
    //need to create a batching system somehow
    static async addOrder(data,username){
        const userid = await db.query(`select id from users where username = $1`,[username]);

        //updating how much money the table has brought in
        const getLocationVal = await db.query(`SELECT totalsales FROM location WHERE id = $1`,[data.tableid]);
        const newTableTotal = parseInt(getLocationVal.rows[0].totalsales) + data.totalcost;

        const updateLocation = await db.query(
            `UPDATE location SET totalsales = $1 WHERE id = $2`,
            [newTableTotal,data.tableid]
        );
        
        //isPaid is set to true, but they would need to be redirected to another page to confirm this
        const updateOrder = await db.query(
            `INSERT INTO orders 
                (ispaid,status,totalcost,batch,fk_locationid,fk_userid) 
              VALUES ($1, $2, $3, $4,$5, $6) 
              RETURNING id`,
            [
              true,
              'ORDERED',
              data.totalcost,
              'date_time_table',
              data.tableid,
              userid.rows[0].id
            ]
        );

        for(let id of data.ids){
            await db.query(
                `INSERT INTO order_item (order_id,item_id)
                VALUES ($1,$2)`,[updateOrder.rows[0].id,id]);
        }
        return updateOrder.rows[0];
    }
    

    // static async addOrderItems(dataList){
    //     //so here we are adding all the order items and also adding the manytomany relationship
    //     //we get the last entry from each table because order will be added first and then order item
    //     let lastorder = await db.query(`SELECT orderid FROM orders ORDER BY orderid DESC LIMIT 1`);
    //     for(const data of dataList)
    //     {
    //         //console.log(data);
    //         const result = await db.query(
    //             `INSERT INTO orderitem 
    //                 (type,flavor,size,topping1,topping2,topping3,topping4,topping5,topping6) 
    //               VALUES ($1, $2, $3, $4, $5,$6,$7,$8,$9) 
    //               RETURNING type,flavor,size,topping1,topping2,topping3,topping4,topping5,topping6`,
    //             [
    //               data.type,
    //               data.flavor,
    //               data.size,
    //               data.topping1,
    //               data.topping2,
    //               data.topping3,
    //               data.topping4,
    //               data.topping5,
    //               data.topping6
    //             ]);
    //         let lastorderitem = await db.query(`SELECT orderitemid FROM orderitem ORDER BY orderitemid DESC LIMIT 1`);
    //         //console.log(lastorderitem.rows[0].orderitemid);
    //         let manytomany = await db.query(
    //             `INSERT INTO order_orderitem (order_id,orderitem_id) VALUES ($1,$2)`,[lastorder.rows[0].orderid, lastorderitem.rows[0].orderitemid]
    //         );
    //     }
    
    //     //return result.rows[0];
    //     return true;
    // }

}

module.exports = Order;