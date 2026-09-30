# TradeX – Stock Trading Simulation Platform

TradeX is a **full-stack stock trading simulation web application** that allows users to practice buying and selling stocks using **virtual money** without any financial risk.

The platform provides stock listings, portfolio management, watchlists, transaction history, authentication, and an admin panel. It is designed to provide a simple and realistic environment for learning and practicing stock trading.

---

## 🚀 Features

### 👤 User Features

* User registration and secure login
* JWT-based authentication
* Search and view stocks
* Buy stocks using virtual funds
* Sell stocks from the portfolio
* View portfolio and virtual balance
* Track transaction history
* Add stocks to a watchlist
* View stock price trends and charts

### 🛡️ Admin Features

* Admin authentication
* Add new stocks
* View stock information
* Update stock details
* Delete stocks
* Manage stock data

### 🔐 Security

* Password hashing using bcrypt
* JWT-based authentication and authorization
* Role-based access control
* Environment variables for sensitive configuration
* Protected API routes

---

## 🛠️ Technologies Used

### Frontend

* React.js
* React Router
* Axios
* Chart.js
* Bootstrap / Tailwind CSS

### Backend

* Node.js
* Express.js
* JWT
* bcryptjs
* CORS
* dotenv

### Database

* MongoDB
* Mongoose

### Tools

* Git & GitHub
* Postman
* VS Code

---

## 🏗️ Project Architecture

```text
User
  ↓
React.js Frontend
  ↓
Axios API Requests
  ↓
Node.js + Express.js Backend
  ↓
Mongoose
  ↓
MongoDB Database
```

---

## 📂 Main Modules

```text
TradeX
│
├── Frontend
│   ├── Login
│   ├── Registration
│   ├── Dashboard
│   ├── Stock Listing
│   ├── Stock Details
│   ├── Portfolio
│   ├── Watchlist
│   └── Transaction History
│
├── Backend
│   ├── Authentication
│   ├── User Management
│   ├── Stock Management
│   ├── Buy/Sell Operations
│   ├── Portfolio Management
│   └── Transaction Management
│
└── Database
    ├── Users
    ├── Stocks
    ├── Portfolios
    ├── Transactions
    └── Watchlists
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/prachimane1001/Tradex-.git
```

Go to the project directory:

```bash
cd Tradex-
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

**Do not upload the `.env` file to GitHub.**

Add this to `.gitignore`:

```text
node_modules/
.env
```

---

## ▶️ Run the Application

### Start Backend

```bash
npm start
```

or:

```bash
npm run dev
```

### Start Frontend

Open another terminal:

```bash
cd frontend
npm start
```

---

## 💰 How Trading Works

TradeX uses virtual funds instead of real money.

For example:

```text
Virtual Balance = $10,000
Stock Price = $200
Quantity = 10

Total Cost = $200 × 10
           = $2,000

Remaining Balance = $8,000
```

After a successful purchase:

* The virtual balance is reduced.
* The purchased shares are added to the portfolio.
* The transaction is saved in the database.

---

## 🔄 CRUD Operations

TradeX implements:

* **Create** – Add new stock/user data
* **Read** – View stock and portfolio information
* **Update** – Update stock information
* **Delete** – Remove stock information

---

## 🎯 Project Objectives

* Provide a risk-free environment for stock trading practice
* Help beginners understand stock trading
* Practice buying and selling using virtual funds
* Manage virtual portfolios
* Track trading history
* Provide stock analysis through charts
* Demonstrate full-stack MERN development

---

## 🔮 Future Scope

* Real-time stock market data integration
* Advanced technical indicators
* Price alerts
* AI-based stock analysis
* Personalized trading insights
* Portfolio performance analytics
* Trading leaderboard
* Support for additional markets

---

## 📚 Learning Outcomes

Through this project, we gained practical experience in:

* MERN stack development
* REST API development
* MongoDB database management
* JWT authentication
* Password security
* CRUD operations
* Role-based authorization
* React development
* API integration
* Portfolio and transaction management

---

## 👩‍💻 Author

**Prachi Mane**

**Project:** TradeX
**Technology:** MERN Stack
**Type:** Stock Trading Simulation Platform

---

## 📄 License

This project is developed for **educational and academic purposes**.
