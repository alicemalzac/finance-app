const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../finance.sqlite');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS months (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    salary REAL DEFAULT 0,
    extra REAL DEFAULT 0,
    philippe REAL DEFAULT 0,
    previous_balance REAL DEFAULT 0,
    UNIQUE(year, month)
  );

  CREATE TABLE IF NOT EXISTS fixed_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    amount REAL DEFAULT 0,
    FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expense_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    monthly_goal REAL DEFAULT 0,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS category_spending (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    amount REAL DEFAULT 0,
    FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE CASCADE,
    UNIQUE(month_id, category_id)
  );

  CREATE TABLE IF NOT EXISTS credit_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS card_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL,
    month_id INTEGER NOT NULL,
    goal_amount REAL DEFAULT 0,
    target_months INTEGER DEFAULT 3,
    FOREIGN KEY (card_id) REFERENCES credit_cards(id) ON DELETE CASCADE,
    FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE,
    UNIQUE(card_id, month_id)
  );

  CREATE TABLE IF NOT EXISTS card_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL,
    month_id INTEGER NOT NULL,
    store TEXT NOT NULL,
    amount REAL NOT NULL,
    installment_current INTEGER DEFAULT 1,
    installment_total INTEGER DEFAULT 1,
    category TEXT,
    subcategory TEXT,
    payment_type TEXT DEFAULT 'avista',
    end_month TEXT,
    FOREIGN KEY (card_id) REFERENCES credit_cards(id) ON DELETE CASCADE,
    FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cash_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month_id INTEGER NOT NULL,
    day INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT,
    subcategory TEXT,
    FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE
  );
`);

module.exports = db;
