const fs   = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const DB_FILE = path.join(dataDir, "shop.json");

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return { users:[], products:[], orders:[], order_items:[], _nextId:{ users:1, products:1, orders:1, order_items:1 } };
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}
function saveDB(db) { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

function seedProducts(db) {
  if (db.products.length > 0) return;
  const products = [
    { name:"Sakura Perfume",     description:"Delicate cherry blossom fragrance",       price:29.99, image:"/images/sakuraperfume.jpg", category:"Beauty",     stock:15 },
    { name:"Rain Lamp",          description:"Soothing rainfall simulation lamp",        price:49.99, image:"/images/rainlamp.jpg", category:"Home",       stock:8  },
    { name:"Sun Tea Set",        description:"Handcrafted ceramic sunny day tea set",    price:39.99, image:"/images/sunteaset.jpg", category:"Kitchen",    stock:12 },
    { name:"Petal Silk Scarf",   description:"Flowing silk with cherry blossom print",  price:59.99, image:"/images/petalsilkscarf.jpg", category:"Fashion",    stock:20 },
    { name:"Storm Boots",        description:"Waterproof rainy day ankle boots",         price:89.99, image:"/images/stormboots.jpg", category:"Fashion",    stock:6  },
    { name:"Golden Sunflower",   description:"Dried sunflower arrangement in vase",      price:24.99, image:"/images/goldensunflower.jpg", category:"Home",       stock:18 },
    { name:"Blossom Face Mask",  description:"Cherry extract deep hydration mask",       price:19.99, image:"/images/blossomfacemask.jpg", category:"Beauty",     stock:30 },
    { name:"Cloud Diffuser",     description:"Ultrasonic mist diffuser rain-shaped",     price:44.99, image:"/images/clouddiffuser.jpg", category:"Home",       stock:10 },
    { name:"Citrus Body Scrub",  description:"Sunny citrus coconut exfoliating scrub",   price:22.99, image:"/images/citrusbody scrub.jpg", category:"Beauty",     stock:25 },
    { name:"Petal Journal",      description:"Cherry blossom embossed leather journal",  price:34.99, image:"/images/petalsilkscarf.jpg", category:"Stationery", stock:14 },
    { name:"Rain Sound Speaker", description:"Bluetooth speaker with nature sounds",     price:79.99, image:"/images/rainsoundspeaker.jpg", category:"Tech",       stock:7  },
    { name:"Sunshine Candle",    description:"Hand-poured beeswax citrus candle",        price:18.99, image:"/images/sunshinecandle.jpg", category:"Home",       stock:22 },
  ];
  products.forEach(p => db.products.push({ id: db._nextId.products++, ...p, created_at: new Date().toISOString() }));
  saveDB(db);
  console.log("? Sample products seeded");
}

const _db = loadDB();
seedProducts(_db);

const DB = {
  findUserByEmail: (email) => loadDB().users.find(u => u.email === email),
  findUserById:    (id)    => loadDB().users.find(u => u.id === id),
  createUser: (name, email, hash) => {
    const db = loadDB();
    const user = { id: db._nextId.users++, name, email, password: hash, created_at: new Date().toISOString() };
    db.users.push(user); saveDB(db); return user;
  },
  getAllProducts: (filters = {}) => {
    let list = [...loadDB().products];
    if (filters.category) list = list.filter(p => p.category === filters.category);
    if (filters.search)   list = list.filter(p => p.name.toLowerCase().includes(filters.search) || p.description.toLowerCase().includes(filters.search));
    if (filters.sort === "price_asc")  list.sort((a,b) => a.price - b.price);
    if (filters.sort === "price_desc") list.sort((a,b) => b.price - a.price);
    return list;
  },
  getProductById: (id) => loadDB().products.find(p => p.id === parseInt(id)),
  getCategories:  ()   => [...new Set(loadDB().products.map(p => p.category))],
  createOrder: (userId, total, address, items) => {
    const db = loadDB();
    const order = { id: db._nextId.orders++, user_id: userId, total, status: "confirmed", address, created_at: new Date().toISOString() };
    db.orders.push(order);
    items.forEach(item => db.order_items.push({ id: db._nextId.order_items++, order_id: order.id, product_id: item.productId, quantity: item.quantity, price: item.price }));
    saveDB(db); return order;
  },
  getOrdersByUser: (userId) => {
    const db = loadDB();
    return db.orders.filter(o => o.user_id === userId).map(order => {
      const items = db.order_items.filter(i => i.order_id === order.id).map(i => {
        const p = db.products.find(p => p.id === i.product_id);
        return { ...i, name: p?.name, image: p?.image };
      });
      return { ...order, items };
    }).reverse();
  }
};

module.exports = DB;


