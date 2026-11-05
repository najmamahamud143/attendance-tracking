const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./attendance.db');

db.serialize(() => {
  // Add year column to sessions table if not exists
  db.run("ALTER TABLE sessions ADD COLUMN year INTEGER DEFAULT 1", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log("✅ year column already exists in sessions.");
      } else {
        console.error("❌ Error adding year to sessions:", err.message);
      }
    } else {
      console.log("✅ year column added to sessions successfully.");
    }
  });

  // Also ensure schedule and students have year (they likely do, but just in case)
  db.run("ALTER TABLE schedule ADD COLUMN year INTEGER DEFAULT 1", (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error("Error adding year to schedule:", err.message);
    }
  });
  db.run("ALTER TABLE students ADD COLUMN year INTEGER DEFAULT 1", (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error("Error adding year to students:", err.message);
    }
  });
});

db.close();