# Attendify

Attendify is a production-grade university attendance platform combining BLE wearable detection, mobile check-in, lecturer dashboards, random classroom re-verification, audit logging, realtime WebSockets, reporting, Redis caching, PostgreSQL storage, and anomaly detection.

## Architecture

The system has four services:

- Node.js Express API and dashboard server.
- PostgreSQL 15 for durable relational data.
- Redis 7 for rate limiting, cache, JWT blacklist, nonces, and active challenge state.
- Flask anomaly microservice using IsolationForest.

Data flows from ESP32 BLE anchors to `/edge/ping`, through RSSI room selection and replay/HMAC verification, then into attendance records. Staff dashboards receive realtime Socket.IO events. Student mobile apps use JWT access tokens, refresh-token cookies, Expo push notifications, and offline sync.

## Docker One-Liner

```bash
cp .env.example .env
docker compose up --build
```

Run migrations:

```bash
docker compose run --rm app node db/migrate.js
```

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `REDIS_URL` | Redis connection string |
| `ESP32_API_KEY` | Hardware API key |
| `ESP32_HMAC_SECRET` | HMAC signing secret for edge payloads |
| `ANOMALY_SERVICE_URL` | Flask anomaly service URL |
| `PUBLIC_HOST` | LAN IP advertised in logs |

## API Summary

- `POST /api/auth/login` staff login
- `POST /api/mobile/login` student login
- `POST /auth/refresh` rotate refresh token
- `POST /auth/logout` revoke refresh token and blacklist access token
- `POST /edge/ping` ESP32 BLE ping, legacy or multi-anchor
- `POST /auth/checkin` student check-in
- `GET /auth/challenge-status` active re-verification status
- `POST /auth/reverify` submit classroom code
- `GET /api/attendance-live` staff realtime feed snapshot
- `GET /api/reports/session/:id/csv` CSV export
- `GET /api/reports/course/:id/pdf` PDF export
- `GET /api/reports/student/:id` student history
- `GET /health` dependency health check
- `GET /api-docs` Swagger UI

## ESP32 Hardware Setup

Each ESP32 anchor scans BLE tags and sends either legacy:

```json
{ "tag_id": "TAG_01", "room_id": "ESP_NODE_01", "rssi": -42, "nonce": "uuid", "timestamp": 1700000000 }
```

or multi-anchor:

```json
{
  "tag_id": "TAG_01",
  "nonce": "uuid",
  "timestamp": 1700000000,
  "readings": [
    { "room_id": "ESP_NODE_01", "rssi": -42 },
    { "room_id": "ESP_NODE_02", "rssi": -78 }
  ]
}
```

Include headers:

- `x-api-key: <ESP32_API_KEY>`
- `x-signature: <HMAC_SHA256(raw_payload, ESP32_HMAC_SECRET)>`

## Development Commands

```bash
make dev
make migrate
make test
make logs
```

Default dashboard login after migrations:

- Staff ID: `admin`
- Password: `admin123`

## Load Testing

Attendify includes Artillery scenarios in `load-tests/` for signed ESP32 edge pings, authenticated student check-ins, multi-anchor BLE readings, and challenge-status reads.

Seed the load-test data:

```bash
npm run load:seed
```

Run the main load test and generate a report:

```bash
npm run load:test
npm run load:report
```

Run the stress test:

```bash
npm run load:stress
```

Optional Docker metrics logging while a test is running:

```powershell
powershell -ExecutionPolicy Bypass -File load-tests/record-docker-metrics.ps1 -Seconds 300
```

Reports are written to `load-tests/load-test-report.html`. See `load-tests/README.md` for the full workflow.
