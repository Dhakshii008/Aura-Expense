# AuraExpense: Modern Glassmorphic Expense Tracker

A premium, state-of-the-art Full Stack Expense Tracker application featuring a glassmorphism dark/light design system, interactive analytics, and robust user authentication.

## 🚀 Features

1. **User Registration & Login**: Secure JWT token-based authentication with bcrypt password hashing.
2. **Dashboard Overview**: 
   - Monthly Metrics: Total Earnings, Spendings, and Net Balance (dynamic colors based on balance).
   - Overall Stats: Cumulative tracking of income and expenses.
3. **Interactive Charts**:
   - **Transaction History**: Dynamic Recharts Area Chart comparing last 6 months' income vs expenses.
   - **Category Breakdown**: Recharts Pie Chart representing categorical distribution of monthly expenses.
4. **Ledger Management**:
   - Add new transactions (Income or Expense) with title, amount, category, date, and description.
   - Edit existing transactions (prefilled forms, live updates).
   - Delete transactions with alert confirmations.
5. **Search & Filtration**:
   - Real-time client-side search by title or description.
   - Filter by type (Income vs Expense) or Category (e.g. Salary, Rent, Food).
6. **Dark Mode UI**: Full HSL dark theme with smooth toggle transition.
7. **Premium Aesthetics**:
   - Dynamic radial gradient glowing backgrounds.
   - High-fidelity glass cards and custom styled forms.
   - Micro-animations via Framer Motion.

---

## 📂 Folder Structure

```text
expense-tracker/
├── backend/
│   ├── app.py              # Flask server and REST API endpoints
│   ├── database.py         # SQLite connection and schema creation
│   ├── requirements.txt    # Python backend dependencies
│   └── expenses.db         # SQLite database file (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx             # Register/Login views with animations
│   │   │   ├── Dashboard.jsx        # Metrics and Recharts analytics
│   │   │   ├── Navbar.jsx           # Global sticky nav and settings
│   │   │   ├── TransactionForm.jsx  # Glass modal for Add/Edit
│   │   │   └── TransactionList.jsx  # Search, filters, and transaction table
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Session management and API helper
│   │   │   └── ThemeContext.jsx     # App theme states (dark/light)
│   │   ├── App.jsx                  # Main routing and global state
│   │   ├── index.css                # Global styles and tailwind directives
│   │   └── main.jsx                 # Vite mounting script
│   ├── index.html          # HTML entry point (contains Google Fonts Inter)
│   ├── postcss.config.js   # PostCSS configuration
│   ├── tailwind.config.js  # Custom Tailwind theme extensions
│   ├── vite.config.js      # Vite compilation configs with local API proxying
│   └── package.json        # Frontend node packages
└── README.md               # App documentation and setup guide
```

---

## 🛠️ Setup Instructions

### 1. Prerequisite Checklist
Ensure you have the following installed on your machine:
- **Python 3.8+**
- **Node.js v18+** & **npm**

---

### 2. Backend Setup
Navigate into the `backend/` directory and install Python dependencies.

1. **Open your terminal and run**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment (Recommended)**:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Requirements**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize Database and Start Server**:
   ```bash
   python app.py
   ```
   *The Flask API server will start running at `http://127.0.0.1:5000`.*

---

### 3. Frontend Setup
Navigate into the `frontend/` directory and install Node dependencies.

1. **Open a new terminal and run**:
   ```bash
   cd frontend
   ```

2. **Install Node Packages**:
   ```bash
   npm install
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   *The application will boot up. Open your browser and navigate to `http://localhost:5173` to interact with AuraExpense.*

---

## 🎨 UI Highlight: Glassmorphic Aesthetics
The interface is designed with a premium frosted-glass design system utilizing CSS backdrop filters. 

### CSS Custom Classes:
- `.glass-panel`: Premium blur and border-lighting container.
- `.glass-card`: Semi-translucent panels for metric cards.
- `.glass-input`: Focus-reactive inputs for auth and transaction operations.
- Dynamic radial blur blobs at the background to produce glowing light leaks.

## 🧪 Production Compilation
To build and optimize the frontend for deployment:
```bash
cd frontend
npm run build
```
This builds a production-ready application inside `frontend/dist/`.
