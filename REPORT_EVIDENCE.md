# Attendify Demo And Report Evidence Checklist

Use this checklist for screenshots, viva preparation, and the final report.

## Core Demo Flow

1. Open dashboard: `http://<laptop-ip>:3000/login.html`
2. Login as staff: `admin / admin123`
3. Open **Class Timetable** and show semester timetable entries.
4. Open **Students** and show demo students with wearable tags.
5. Start ESP32 scanner and show `TAG_01` posting successfully.
6. Student logs into mobile app and checks in.
7. Open **Live Monitor** and show the student status changing to `CHECKED_IN`.
8. During the challenge window, show the lecturer classroom code.
9. Student submits the code and status becomes `VERIFIED`.
10. Open **Analytics** and show KPI cards, weekly percentage chart, heatmap, and threshold table.

## Screenshots To Capture

- Docker services running: `docker compose ps`
- Health endpoint showing DB, Redis, and anomaly service connected.
- ESP32 serial monitor with `HTTP 200 OK`.
- Live Monitor showing a checked-in student.
- Active re-verification code on the lecturer dashboard.
- Student app re-verification success.
- Analytics page with charts.
- Load-test report showing total requests, p95, and 0% error rate.

## Report Explanation

The timetable is configured by the lecturer or administrator once per semester. During a class period, the server matches ESP32 room pings and student mobile check-ins against the active timetable entry using room ID, day, time, and year. The system then creates attendance records automatically.

## Demo Data

Run this after Docker is running:

```powershell
npm.cmd run demo:seed
```

Run this to remove generated load-test students:

```powershell
npm.cmd run load:cleanup
```
