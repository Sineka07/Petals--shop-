const express = require("express");
const router  = express.Router();
const DB      = require("../db");

router.get("/", (req, res) => {
  const { category, search, sort } = req.query;
  res.json(DB.getAllProducts({ category, search: search?.toLowerCase(), sort }));
});
router.get("/meta/categories", (req, res) => res.json(DB.getCategories()));
router.get("/:id", (req, res) => {
  const p = DB.getProductById(req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
});

module.exports = router;
