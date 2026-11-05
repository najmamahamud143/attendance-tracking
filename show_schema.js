const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./attendance.db');

console.log("\n📋 DATABASE SCHEMA\n");
db.all("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL", (err, rows) => {
  if (err) {
    console.error("Error fetching schema:", err.message);
  } else {
    rows.forEach(row => {
      console.log(row.sql);
      console.log("----------------------------------------");
    });
  }
  db.close();
});