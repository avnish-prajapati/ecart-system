# E-Cart: Mini Shopping App (MERN)

A small full-stack shopping application with two sides: an **admin** who manages products and a **user** who shops and keeps a cart.
Built as a college project with **React (Vite)**, **Node.js + Express** and **MongoDB**.

**Author:** Naveen Giri, SY BCA-B

---

## 1. Project requirements and where they are done

| # | Requirement | How it is done in this project |
|---|---|---|
| 1 | Multi-user system (admin side, user side) | `role` field on the User (`admin` or `user`). Login sends each role to its own pages. |
| 2 | Authentication | Register and login. Login returns a JWT token. |
| 3 | Authorization (token needed for resources) | `verifyToken` middleware on every product and cart API. `isAdmin` middleware on admin-only APIs. |
| 4 | Secure password | Passwords are hashed with **bcrypt** before saving. |
| 5 | Forgot password (nodemailer + OTP) | 3 steps: send 6-digit OTP by email, verify OTP, set a new password. OTP is saved as a hash and expires in 10 minutes. |
| 6 | Admin: CRUD, pagination, filter | Admin product page: add, edit, delete, category filter, name search, Prev/Next pages. |
| 7 | User sees data added by admin | The Shop page shows the products created by the admin. |
| 8 | User: CRUD, filter, pagination | Cart: add, change quantity, remove. Cart and Shop both have filter and pagination. |
| 9 | Frontend + backend | React app (port 5173) talks to the Express API (port 5000). |
| 10 | Documentation | This README. |

---

## 2. Tech stack

**Frontend:** React 18, Vite, react-router-dom, axios
**Backend:** Node.js, Express, MongoDB with Mongoose, bcrypt, jsonwebtoken, nodemailer, cors, dotenv

---

## 3. Folder structure

```
ecart-system/
├── backend/
│   ├── config/db.js               MongoDB connection
│   ├── models/                    User.js, Product.js, Cart.js  (what data looks like)
│   ├── controllers/               authController.js, productController.js, cartController.js  (the logic)
│   ├── routes/                    authRoutes.js, productRoutes.js, cartRoutes.js  (URL -> controller)
│   ├── middleware/                verifyToken.js, isAdmin.js  (guards)
│   ├── utils/sendEmail.js         nodemailer
│   ├── seed.js                    creates the first admin and sample products
│   ├── server.js                  starting point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/axios.js           axios with the token added automatically
    │   ├── context/AuthContext.jsx  who is logged in
    │   ├── components/            Navbar, ProtectedRoute, Pagination
    │   ├── pages/                 Login, Register, ForgotPassword
    │   │   ├── admin/AdminProducts.jsx
    │   │   └── user/Shop.jsx, Cart.jsx
    │   ├── App.jsx                all routes
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    └── package.json
```

---

## 4. How the backend works

Every request travels the same road:

```
Request  ->  route  ->  verifyToken  ->  isAdmin (only admin routes)  ->  controller  ->  model (MongoDB)  ->  Response
```

- **model**: what data looks like
- **controller**: what happens when a request comes
- **route**: which URL calls which controller
- **middleware**: guards that check the token or role before the controller runs

**Token flow:** after login the server gives a JWT containing the user's `id` and `role`, signed with `JWT_SECRET`.
The frontend saves it and sends `Authorization: Bearer <token>` with every request.
`401` means "not logged in or bad token". `403` means "logged in, but not allowed (not admin)".

**Database design:**

| Model | Fields |
|---|---|
| User | name, email (unique), password (hash), role, resetOtp (hash), resetOtpExpire |
| Product | name, price, category, image, stock |
| Cart | user (ref User), product (ref Product), quantity. One row per user and product. |

**Pagination:** `?page=2&limit=5` becomes `skip((page-1) * limit).limit(limit)` in MongoDB.
**Filter:** `?category=Shoes&search=run` builds a MongoDB condition (search is case-insensitive).

---

## 5. How to run the project

You need: **Node.js**, **MongoDB** (local with Compass, or a free Atlas cluster) and **Postman** (optional, for testing).

### Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill it in:

| Variable | Meaning |
|---|---|
| `PORT` | Backend port (5000) |
| `MONGO_URI` | MongoDB connection link |
| `JWT_SECRET` | Any long random text |
| `CLIENT_URL` | Frontend address (`http://localhost:5173`) |
| `EMAIL_USER`, `EMAIL_PASS` | Gmail address and Gmail **App Password** for OTP emails. If left empty, the OTP is printed in the backend terminal. |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used by the seed script |

Create the first admin and sample products (run once):

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

You should see `MongoDB Connected Successfully` and `Server running on port 5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.
If your backend is not on port 5000, copy `frontend/.env.example` to `frontend/.env` and change `VITE_API_URL`.

### Login details after seeding

| Side | Email | Password |
|---|---|---|
| Admin | `admin@ecart.com` | `admin123` (or what you set in `.env`) |
| User | Register a new account on the Register page | |

---

## 6. API list

Base URL: `http://localhost:5000/api`

### Auth

| Method | URL | Token | Body | What it does |
|---|---|---|---|---|
| POST | `/auth/register` | No | name, email, password | Create a user |
| POST | `/auth/login` | No | email, password | Returns token, role, name |
| GET | `/auth/me` | Yes | | Logged-in user's details |
| POST | `/auth/forgot-password` | No | email | Emails a 6-digit OTP |
| POST | `/auth/verify-otp` | No | email, otp | Checks the OTP |
| POST | `/auth/reset-password` | No | email, otp, newPassword | Saves the new password |

### Products

| Method | URL | Who | What it does |
|---|---|---|---|
| GET | `/products?page=1&limit=5&category=&search=` | Any logged-in | List with pagination and filter |
| GET | `/products/categories` | Any logged-in | All category names |
| GET | `/products/:id` | Any logged-in | One product |
| POST | `/products` | **Admin** | Create |
| PUT | `/products/:id` | **Admin** | Update |
| DELETE | `/products/:id` | **Admin** | Delete (also removes it from carts) |

### Cart (all need a token, each user sees only their own cart)

| Method | URL | Body | What it does |
|---|---|---|---|
| GET | `/cart?page=1&limit=5&category=` | | Cart items with pagination, filter and cart total |
| POST | `/cart` | productId, quantity | Add to cart (or increase quantity) |
| PUT | `/cart/:id` | quantity | Change quantity |
| DELETE | `/cart/:id` | | Remove from cart |

Send the token in Postman: **Authorization tab, Bearer Token**.

---

## 7. Pages

| URL | Who | Page |
|---|---|---|
| `/login`, `/register`, `/forgot` | Everyone | Authentication pages |
| `/admin` | Admin | Product table: add, edit, delete, filter, pagination |
| `/shop` | User | Product cards: filter, search, pagination, add to cart |
| `/cart` | User | Cart: quantity +/-, remove, filter, pagination, total |

A user who opens `/admin` is sent back to the home page, and a visitor without login is sent to `/login`.

---

## 8. Screenshots

Add your screenshots here before submitting (login, admin products, shop, cart, Postman test).

---

## 9. Security notes

- Passwords and OTPs are stored as bcrypt hashes, never as plain text.
- Secrets are kept in `.env`, which is listed in `.gitignore`.
- Login gives the same error for a wrong email and a wrong password.
- A cart item is always searched with both its id and the logged-in user's id, so nobody can touch another user's cart.
- Stock is checked on the server before adding to the cart.

---

## 10. Possible improvements

Orders and checkout, payment, product image upload, refresh tokens, and automated tests.
