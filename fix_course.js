const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./attendance.db');

// Insert the missing course (if not exists)
db.run(`INSERT OR IGNORE INTO courses (course_code, course_name) VALUES (?, ?)`,
  ['CSC3604', 'Advanced Databases'],
  function(err) {
    if (err) {
      console.error("Error inserting course:", err.message);
    } else {
      console.log(`✅ Course CSC3604 inserted (or already existed).`);
    }
  }
);

// Verify the schedule exists for today (Thursday) with time covering now
db.get(`SELECT * FROM schedule WHERE course_code = ? AND day_of_week = ?`,
  ['CSC3604', 'Thursday'],
  (err, row) => {
    if (err) {
      console.error("Error checking schedule:", err.message);
    } else if (row) {
      console.log("✅ Schedule found:", row);
    } else {
      console.log("❌ No schedule for CSC3604 on Thursday. Please add it via dashboard.");
    }
    db.close();
  }
);