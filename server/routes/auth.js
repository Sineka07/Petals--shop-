const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const DB      = require("../db");
const SECRET  = process.env.JWT_SECRET || "petal-jwt-secret";

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
  if (DB.findUserByEmail(email)) return res.status(409).json({ error: "Email already registered" });
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = DB.createUser(name, email, hash);
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = DB.findUserByEmail(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.post("/logout", (req, res) => { req.session?.destroy(); res.json({ ok: true }); });

router.get("/me", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try { res.json({ user: jwt.verify(token, SECRET) }); }
  catch { res.status(401).json({ error: "Invalid token" }); }
});

module.exports = router;
