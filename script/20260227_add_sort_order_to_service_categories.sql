-- Migration: Add sort_order to service_categories
ALTER TABLE service_categories ADD COLUMN sort_order INTEGER DEFAULT 0;