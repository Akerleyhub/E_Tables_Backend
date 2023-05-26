/*
    Waitstaff specific logic(not much). Getting orders and Marking orders.
    Will expand.
*/  

const db = require("../db");


class WaitStaff{
    // Need user so we can check what business they're associated with
    static async getOrders(user)
    {
        let busid = await db.query(`SELECT fk_businessid FROM users WHERE username=$1`,[user]);

        let orders = await db.query(`SELECT id from orders 
            where status='PENDING' 
            and fk_locationid in (select id from location where fk_businessid=$1)`,
            [busid.rows[0].fk_businessid]);


        let orderWithItems = [];
        orders = orders.rows;
        var res;
        for(let orderid of orders){
            res = await db.query(
                `SELECT i.name,i.itemtype,i.description,o.fk_locationid
                FROM items i
                JOIN order_item oi ON oi.item_id = i.id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.id=$1
                ORDER BY o.orderdatetime`,
                [orderid.id]);

            orderWithItems.push(res.rows);
        }

        //tieing the two results together. "ordernumber":[{"items being ordered"},{},{}]
        var result = {};
        orders.forEach((order, i) => result[order.id] = orderWithItems[i]);
        //console.log(result);

        return result;
    }

    // Cook will change status to PENDING after they complete an order.
    static async markComplete(order)
    {
        await db.query(`UPDATE orders SET status='COMPLETE' WHERE id=$1`,[order.order_num]);

        return true;
    }

}

module.exports = WaitStaff;