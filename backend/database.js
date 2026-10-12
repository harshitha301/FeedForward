const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./feedforward.db", (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("SQLite database connected.");
  }
});

db.serialize(() => {
  // USERS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('donor', 'organization', 'admin')),
      phone TEXT,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ORGANIZATIONS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      organization_name TEXT NOT NULL,
      organization_type TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      required_meals INTEGER DEFAULT 0,
      verified INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // FOOD DONATIONS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS food_donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id INTEGER NOT NULL,
      food_name TEXT NOT NULL,
      food_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      prepared_time TEXT,
      best_before TEXT,
      location TEXT NOT NULL,
      description TEXT,
      image TEXT,
      status TEXT DEFAULT 'AVAILABLE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES users(id)
    )
  `);

  // FOOD REQUESTS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS food_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_id INTEGER NOT NULL,
      organization_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      status TEXT DEFAULT 'REQUESTED',
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (food_id) REFERENCES food_donations(id),
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    )
  `);

  console.log("FeedForward database tables are ready.");
});

module.exports = db;