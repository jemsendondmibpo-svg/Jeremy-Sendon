import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("inventory.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    minStock INTEGER NOT NULL,
    price REAL NOT NULL,
    status TEXT NOT NULL,
    location TEXT
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT NOT NULL,
    action TEXT NOT NULL,
    item TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed data if empty
const count = db.prepare("SELECT count(*) as count FROM inventory").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare("INSERT INTO inventory (id, name, sku, category, quantity, minStock, price, status, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const seedData = [
    ['1', 'Dell OptiPlex 7090', 'SYS-DL-001', 'System Unit', 15, 5, 1200, 'In Stock', '10'],
    ['2', 'Samsung 27" Odyssey', 'MON-SM-002', 'Monitor', 8, 10, 350, 'Low Stock', '57'],
    ['3', 'Logitech G Pro X', 'KBD-LG-003', 'Keyboard', 25, 5, 129, 'In Stock', '64'],
    ['4', 'Razer DeathAdder V3', 'MSE-RZ-004', 'Mouse', 0, 5, 69, 'Out of Stock', '82'],
    ['5', 'Jabra Evolve2 65', 'HDS-JB-005', 'Headset', 12, 3, 249, 'In Stock', '11'],
  ];
  for (const item of seedData) {
    insert.run(...item);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/inventory", (req, res) => {
    const items = db.prepare("SELECT * FROM inventory").all();
    res.json(items);
  });

  app.get("/api/activity", (req, res) => {
    const logs = db.prepare("SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 10").all();
    res.json(logs);
  });

  // Auth Routes
  app.post("/api/signup", (req, res) => {
    const { fullName, email, password } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    try {
      db.prepare("INSERT INTO users (id, fullName, email, password) VALUES (?, ?, ?, ?)")
        .run(id, fullName, email, password);
      const user = db.prepare("SELECT id, fullName, email, avatar FROM users WHERE id = ?").get(id);
      res.status(201).json(user);
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT id, fullName, email, avatar FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  });

  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { fullName, email, avatar } = req.body;
    try {
      db.prepare("UPDATE users SET fullName = ?, email = ?, avatar = ? WHERE id = ?")
        .run(fullName, email, avatar, id);
      const user = db.prepare("SELECT id, fullName, email, avatar FROM users WHERE id = ?").get(id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/inventory", (req, res) => {
    const { id, name, sku, category, quantity, minStock, price, status, location } = req.body;
    db.prepare("INSERT INTO inventory (id, name, sku, category, quantity, minStock, price, status, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, sku, category, quantity, minStock, price, status, location);
    
    db.prepare("INSERT INTO activity_log (user, action, item) VALUES (?, ?, ?)")
      .run("Admin", "Added new item", name);
      
    res.status(201).json({ success: true });
  });

  app.put("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const { name, sku, category, quantity, minStock, price, status, location } = req.body;
    
    const oldItem = db.prepare("SELECT name FROM inventory WHERE id = ?").get(id) as { name: string };
    
    db.prepare("UPDATE inventory SET name = ?, sku = ?, category = ?, quantity = ?, minStock = ?, price = ?, status = ?, location = ? WHERE id = ?")
      .run(name, sku, category, quantity, minStock, price, status, location, id);
    
    db.prepare("INSERT INTO activity_log (user, action, item) VALUES (?, ?, ?)")
      .run("Admin", "Updated item", name || oldItem.name);
      
    res.json({ success: true });
  });

  app.delete("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const item = db.prepare("SELECT name FROM inventory WHERE id = ?").get(id) as { name: string };
    
    db.prepare("DELETE FROM inventory WHERE id = ?").run(id);
    
    if (item) {
      db.prepare("INSERT INTO activity_log (user, action, item) VALUES (?, ?, ?)")
        .run("Admin", "Deleted item", item.name);
    }
    
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
