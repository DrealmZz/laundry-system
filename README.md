# Hybrid Laundry Management System

> A mobile and web-based hybrid laundry management application (Kilo & Coin).

The system supports two primary services:
- **Kilo (Weight-based)**: Customers drop off their clothes or have them picked up by a courier.
- **Coin (Self-Service)**: Customers visit the outlet and use the machines themselves.

---

## Key Features

### Customer (Mobile App)
- Registration and authentication
- Book weight-based (Kilo) and self-service (Coin) laundry
- Select washing machines and dryers (for Coin service)
- Real-time order tracking
- Automatic order status notifications
- Transaction history

### Cashier (Web Dashboard)
- Process payments (Cash, Bank Transfer, QRIS)
- Generate digital receipts (PDF)
- Daily transaction summary
- Verify order pickups

### Admin (Web Dashboard)
- Manage laundry services (CRUD)
- Manage washing/drying machines (CRUD)
- Approve or reject bookings
- Update order statuses
- Manage employee shifts
- Send notifications to customers

### Owner (Web Dashboard)
- Business overview dashboard
- Financial reports with date filtering
- Export reports to PDF or Excel
- Real-time transaction monitoring
- System audit logs

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo |
| Web | Vite + React + TypeScript |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Authentication | JWT + bcrypt |
| PDF Generation | pdfkit |
| Excel Export | exceljs |
| Email Service | Mailgun |

---

## Project Structure

```
laundry-system/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── user-management/
│       │   ├── laundry-service/
│       │   ├── machine/
│       │   ├── pemesanan/
│       │   ├── transaction/
│       │   ├── shift/
│       │   ├── notification/
│       │   ├── audit/
│       │   └── report/
│       └── shared/
├── frontend/
│   ├── mobile/
│   ├── web/
│   └── public/
├── database/
│   ├── schema.sql
│   ├── migrations/
│   └── seeds/
└── docs/
    ├── api-spec.md
    └── modules/
```

---

## Setup & Installation

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 16
- npm or yarn
- Expo CLI (for mobile app)

### 1. Database

```bash
createdb laundry_system

psql -U postgres -d laundry_system -f database/schema.sql

psql -U postgres -d laundry_system -f database/migrations/002_add_booking_mesin.sql
psql -U postgres -d laundry_system -f database/migrations/003_add_shifts.sql
psql -U postgres -d laundry_system -f database/migrations/004_add_notifications.sql

psql -U postgres -d laundry_system -f database/seeds/001_dev_seed.sql
```

### 2. Backend

```bash
cd backend
npm install
npm install pdfkit puppeteer exceljs mailgun.js
cp .env.example .env
npm run dev
```

The server will run at http://localhost:3000

### 3. Mobile App

```bash
cd frontend/mobile
npm install
npm start
```

Open and test using Expo Go.

### 4. Web Dashboard

```bash
cd frontend/web
npm install
npm run dev
```

Runs at http://localhost:5173

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following configuration:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=laundry_system

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# CORS
CORS_ORIGIN=http://localhost:5173

# Mailgun
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```

---

## API Documentation

Base URL: `http://localhost:3000/api/v1`

### Quick Start Examples

**Register:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama_lengkap": "John Doe",
    "username": "johndoe",
    "email": "john@email.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "johndoe",
    "password": "password123"
  }'
```

### Endpoint List

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Auth | POST | `/auth/register` | Register customer |
| Auth | POST | `/auth/login` | Login |
| Auth | GET | `/auth/me` | Current user details |
| Auth | POST | `/auth/forgot-password` | Reset password via email |
| Services | GET | `/services` | List laundry services |
| Services | POST | `/services` | Create new service (admin) |
| Machines | GET | `/mesin` | List machines |
| Machines | POST | `/mesin` | Create new machine (admin) |
| Machines | PATCH | `/mesin/:id/status` | Update machine status |
| Bookings | GET | `/pemesanan` | List bookings |
| Bookings | POST | `/pemesanan` | Create booking |
| Bookings | PATCH | `/pemesanan/:id/status` | Update booking status |
| Transactions | GET | `/transaksi` | List transactions |
| Transactions | POST | `/transaksi` | Create transaction |
| Transactions | PATCH | `/transaksi/:id/pay` | Confirm payment |
| Transactions | GET | `/transaksi/:id/pdf` | Download PDF receipt |
| Shifts | GET | `/shifts` | List shifts |
| Shifts | POST | `/shifts` | Create shift (admin) |
| Notifications | GET | `/notifications` | List notifications |
| Reports | GET | `/reports/finance` | Financial reports |
| Audit | GET | `/audit` | Audit logs |

Full documentation: [docs/api-spec.md](docs/api-spec.md)

---

## Database Schema

The system uses 12 relational tables:

| Table | Description |
|-------|-------------|
| `customer` | Customer accounts |
| `karyawan` | Cashier and Admin accounts |
| `owner` | Owner accounts |
| `mesin_cuci` | List of washing machines and dryers |
| `layanan` | Available services (Kilo/Coin) |
| `pemesanan` | Order and booking records |
| `transaksi` | Payments and transactions |
| `booking_mesin` | Many-to-many relation for booking and machines |
| `shifts` | Shift schedules |
| `shift_karyawan` | Many-to-many relation for employees and shifts |
| `notifikasi` | System notifications for customers |
| `audit_log` | Action logging for audit |

Schema details: [database/schema.sql](database/schema.sql)

---

## User Roles

| Role | Platform | Main Access |
|------|----------|-------------|
| Customer | Mobile | Bookings, order tracking, history |
| Cashier | Web | Order processing, payments |
| Admin | Web | Master data, scheduling |
| Owner | Web | Reports, monitoring |

---

## Documentation

| Document | Description |
|---------|-----------|
| [SRS](docs/) | Software Requirements Specification |
| [API Spec](docs/api-spec.md) | API endpoints specification |
| [Module Docs](docs/modules/) | Detailed module-by-module docs |

---


## Development Team


| Username | Task |
|----------|-------|
| DrealmZz | Lead, Backend API, Integration |
| skyrel11 | UI/UX, Frontend Mobile |
| chocoberryy |  Database Design |

---

## License

This project was developed for academic purposes under the Software Engineering course.