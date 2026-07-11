-- Migration: Add sales_targets table for owner monthly sales target
-- Sprint 3: Sales Target Tracking

CREATE TABLE IF NOT EXISTS sales_targets (
    id              SERIAL PRIMARY KEY,
    periode         VARCHAR(7) NOT NULL UNIQUE,
    target_amount   NUMERIC(14,2) NOT NULL DEFAULT 0,
    id_owner        INTEGER REFERENCES owner(id_owner),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_targets_periode ON sales_targets(periode);
