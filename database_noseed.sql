/*
1. Have Postgresql configured on your computer with a superuser name of postgres(optional name)
2. Create db named etables from terminal
run the file using the command beleow from terminal, postgres is the username, etables is the database, database.sql is the file
3. psql -U postgres -d etables -a -f database.sql
4. Wait a couple minutes since 12 images...
5. Don't do select * from items; Bc the base64 string doesnt get compressed.
*/

DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS business CASCADE;
DROP TABLE IF EXISTS location CASCADE;
DROP TABLE IF EXISTS order_item CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS menu_item CASCADE;


--https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-data-types/
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL,
    firstname VARCHAR(30),
    lastname VARCHAR(30),
    usertype VARCHAR(15) default 'CUSTOMER', --CUSTOMER, COOK, WAITSTAFF, ADMIN
    datemade TIMESTAMPTZ default current_timestamp,
    fk_businessid integer REFERENCES business (id) --need this for any non-customer accounts
);

-- No clob, but BYTEA is used for images,audio,videos.... But we're going w text. Cloud bucket in future?
-- Parent business in case a single business owns multiple resteraunts. 
CREATE TABLE business(
    id SERIAL PRIMARY KEY,
    name VARCHAR(40) NOT NULL,
    city VARCHAR(40) NOT NULL,
    state VARCHAR(30) NOT NULL,
    zip VARCHAR(5) NOT NULL,
    logo TEXT,
    colorscheme VARCHAR(20),
    menuid INTEGER,
    active BOOLEAN,
    dateadded TIMESTAMPTZ default current_timestamp,
    busemail VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    parent_business VARCHAR(50) default NULL
);

CREATE TABLE menus(
    id SERIAL PRIMARY KEY,
    name VARCHAR(30),
    description VARCHAR(50),
    active BOOLEAN
);

CREATE TABLE location(
    id SERIAL PRIMARY KEY,
    totalsales DECIMAL,
    active BOOLEAN default TRUE,
    name VARCHAR(60) NOT NULL,
    fk_menuid integer REFERENCES menus(id),
    fk_businessid integer REFERENCES business (id)
);

--menuid refers to one specific item on the menu, 
--menu name should refer to the name one menu a business have
CREATE TABLE items(
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    description VARCHAR(100),
    foodordrink VARCHAR(15), -- FOOD/DRINK
    itemtype VARCHAR(20), --APP, ENTREE,DESSERT, ALC, NONALC
    cost DECIMAL,
    itemimage TEXT,
    active BOOLEAN,
    fk_businessid integer REFERENCES business (id)
);

--need this since one business can have multiple menus
CREATE TABLE menu_item(
  menu_id int REFERENCES menus (id) ON UPDATE CASCADE,
  item_id int REFERENCES items (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT menuitem_pkey PRIMARY KEY (menu_id,item_id)  -- explicit pk
);

CREATE TABLE orders(
    id SERIAL PRIMARY KEY,
    ispaid BOOLEAN default FALSE,
    tipgraditude DECIMAL default NULL,
    batch VARCHAR(50),
    orderdatetime TIMESTAMP default current_timestamp, --these three will keep metrics on how long things take to finish
    cooktime TIMESTAMP default NULL,
    deliverytime TIMESTAMP default NULL,
    totalcost DECIMAL,
    pickuptime VARCHAR(65),
    status VARCHAR(10), --ORDERED(by customer), PENDING(by cook), COMPLETE(by waitstaff)
    comment VARCHAR(50),
    fk_locationid integer REFERENCES location (id),
    fk_userid integer REFERENCES users (id)
);

-- https://stackoverflow.com/questions/9789736/how-to-implement-a-many-to-many-relationship-in-postgresql
CREATE TABLE order_item (
  order_id int REFERENCES orders (id) ON UPDATE CASCADE,
  item_id int REFERENCES items (id) ON UPDATE CASCADE ON DELETE CASCADE,
  --status VARCHAR(10), --I think we need this at the individual item level so drinks can bypass to pending
  CONSTRAINT order_orderitem_pkey PRIMARY KEY (order_id,item_id)  -- explicit pk
);