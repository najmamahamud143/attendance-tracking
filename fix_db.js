const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./attendance.db');

db.serialize(() => {
    console.log("🛠️ Starting Database Integrity Fix...");

    // 1. Ensure required courses exist
    const courses = [
        ['CSC402', 'Distributed Databases'],
        ['CSC4023', 'Advanced Distributed Systems'],
        ['CSC3604', 'Computer Networks'],
        ['TEST101', 'Test Course']
        // add any other course codes you use
    ];

    courses.forEach(([code, name]) => {
        db.run(`INSERT OR IGNORE INTO courses (course_code, course_name) VALUES (?, ?)`, [code, name], function(err) {
            if (err) {
                console.error(`❌ Error inserting course ${code}:`, err.message);
            } else {
                if (this.changes > 0) console.log(`✅ Added course: ${code} - ${name}`);
            }
        });
    });

    // 2. Ensure required rooms exist
    const rooms = [
        ['ESP_NODE_01', 'Computer Lab 3'],
        ['ESP_NODE_012', 'Lab 12']
    ];

    rooms.forEach(([id, name]) => {
        db.run(`INSERT OR IGNORE INTO rooms (room_id, room_name) VALUES (?, ?)`, [id, name], function(err) {
            if (err) {
                console.error(`❌ Error inserting room ${id}:`, err.message);
            } else {
                if (this.changes > 0) console.log(`✅ Added room: ${id} - ${name}`);
            }
        });
    });

    // 3. Add a test schedule for today (Friday) with time 13:00-17:00
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Friday"
    // Only add if today is Friday, but you can remove the condition if you want to force
    if (today === 'Friday') {
        db.run(`INSERT OR IGNORE INTO schedule 
                (course_code, room_id, day_of_week, start_time, end_time, year) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                ['CSC402', 'ESP_NODE_01', today, '13:00', '17:00', 4],
                function(err) {
            if (err) {
                console.error("❌ Error inserting test schedule:", err.message);
            } else {
                if (this.changes > 0) console.log("✅ Added test schedule for today (13:00-17:00).");
                else console.log("ℹ️ Schedule already exists (or conflict).");
            }
        });
    } else {
        console.log("ℹ️ Today is not Friday, skipping automatic schedule insertion.");
    }

    console.log("🚀 Database integrity fix complete.");
});

db.close();