-- ============================================================
-- Laundry System Hybrid - Database Schema
-- PostgreSQL 15+
-- ============================================================

-- Enum types
CREATE TYPE user_role AS ENUM ('customer', 'kasir', 'admin', 'owner');
CREATE TYPE booking_status AS ENUM ('menunggu_konfirmasi', 'dikonfirmasi', 'diproses', 'selesai', 'dibatalkan');
CREATE TYPE service_type AS ENUM ('kiloan', 'koin');
CREATE TYPE machine_type AS ENUM ('washer', 'dryer');
CREATE TYPE machine_status AS ENUM ('available', 'in_use', 'maintenance');
CREATE TYPE payment_method AS ENUM ('cash', 'transfer', 'qris');

-- Users
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    phone       VARCHAR(20),
    password    VARCHAR(255) NOT NULL,
    role        user_role NOT NULL DEFAULT 'customer',
    is_locked   BOOLEAN NOT NULL DEFAULT FALSE,
    failed_attempts SMALLINT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Laundry services (kiloan / koin)
CREATE TABLE services (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    type        service_type NOT NULL,
    price       NUMERIC(10,2) NOT NULL,
    unit        VARCHAR(20) NOT NULL DEFAULT 'per kg',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- Machines
CREATE TABLE machines (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    type        machine_type NOT NULL,
    status      machine_status NOT NULL DEFAULT 'available',
    capacity_kg SMALLINT
);

-- Shifts
CREATE TABLE shifts (
    id          SERIAL PRIMARY KEY,
    kasir_id    INTEGER NOT NULL REFERENCES users(id),
    date        DATE NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL
);

-- Bookings
CREATE TABLE bookings (
    id              SERIAL PRIMARY KEY,
    customer_id     INTEGER NOT NULL REFERENCES users(id),
    service_id      INTEGER NOT NULL REFERENCES services(id),
    machine_id      INTEGER REFERENCES machines(id),
    status          booking_status NOT NULL DEFAULT 'menunggu_konfirmasi',
    estimated_weight NUMERIC(5,2),
    scheduled_at    TIMESTAMPTZ NOT NULL,
    confirmed_by    INTEGER REFERENCES users(id),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
    id              SERIAL PRIMARY KEY,
    booking_id      INTEGER NOT NULL REFERENCES bookings(id),
    kasir_id        INTEGER NOT NULL REFERENCES users(id),
    shift_id        INTEGER REFERENCES shifts(id),
    amount          NUMERIC(10,2) NOT NULL,
    payment_method  payment_method NOT NULL DEFAULT 'cash',
    paid_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,
    entity      VARCHAR(50),
    entity_id   INTEGER,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status   ON bookings(status);
CREATE INDEX idx_transactions_kasir ON transactions(kasir_id);
CREATE INDEX idx_audit_logs_user   ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
