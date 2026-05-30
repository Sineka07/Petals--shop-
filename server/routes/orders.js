const express = require("express");
const router  = express.Router();
const DB      = require("../db");
const jwt     = require("jsonwebtoken");
const SECRET  = process.env.JWT_SECRET || "petal-jwt-secret";

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Login required" });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: "Invalid token" }); }
}

router.post("/place", auth, (req, res) => {
  const { address, items, total } = req.body;
  if (!items?.length) return res.status(400).json({ error: "No items" });
  const order = DB.createOrder(req.user.id, total, address, items);
  req.session.cart = [];
  res.json({ ok: true, orderId: order.id });
});

router.get("/mine", auth, (req, res) => {
  res.json(DB.getOrdersByUser(req.user.id));
});

module.exports = router;
