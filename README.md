# 🌸 Petal Shop — E-Commerce Store

A full-stack e-commerce store with 3 auto-cycling themes:
**Cherry Blossom 🌸 | Rainy Day 🌧️ | Sunny Morning ☀️**

## Features
- 🛍️ Product listing with search, filter, sort
- 📄 Product detail page
- 🛒 Shopping cart (session-based)
- 👤 User registration & login (JWT)
- 📦 Order placement & history
- 🎨 3 auto-cycling themes (every 30 seconds)
- 💾 SQLite database (no setup needed)

## Project Structure
```
petal-shop/
├── package.json
├── .env
├── server/
│   ├── index.js          ← Express server
│   ├── db.js             ← SQLite database + seed
│   └── routes/
│       ├── auth.js       ← Register/Login/JWT
│       ├── products.js   ← Product CRUD
│       ├── cart.js       ← Cart (session)
│       └── orders.js     ← Order placement
├── public/
│   ├── index.html        ← Home page
│   ├── shop.html         ← All products
│   ├── product.html      ← Product detail
│   ├── cart.html         ← Shopping cart
│   ├── checkout.html     ← Checkout form
│   ├── orders.html       ← Order history
│   ├── auth.html         ← Login/Register
│   ├── css/
│   │   └── style.css     ← 3-theme CSS system
│   └── js/
│       └── app.js        ← Theme, Auth, Cart logic
└── data/
    └── shop.db           ← Auto-created SQLite DB
```

## Setup & Run

```bash
# 1. Install
npm install

# 2. Start
npm start
```

Open: **http://localhost:3000**

## Tech Stack
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3) — no setup needed!
- **Auth**: JWT + bcryptjs + express-session
- **Frontend**: HTML + CSS + Vanilla JS
- **Themes**: CSS custom properties (3 themes)
