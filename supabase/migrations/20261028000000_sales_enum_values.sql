-- ==============================================================================
-- INFRIVA SOLUTIONS - SALES WORKSPACE ENUM EXTENSIONS
-- Migration Version: 20261028000000
--
-- Kept in its own migration: Postgres cannot use a newly added enum value in
-- the same transaction that adds it, and 20261028000100 references these.
-- ==============================================================================

-- Quotation approval workflow: DRAFT -> PENDING_APPROVAL -> APPROVED | CHANGES_REQUESTED
--                              APPROVED -> SENT -> ACCEPTED | REJECTED
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL' AFTER 'DRAFT';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'APPROVED' AFTER 'PENDING_APPROVAL';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'CHANGES_REQUESTED' AFTER 'APPROVED';

-- Leads keyed in by a rep (walk-ins, phone enquiries, WhatsApp DMs).
ALTER TYPE lead_source_channel ADD VALUE IF NOT EXISTS 'MANUAL_ENTRY';
