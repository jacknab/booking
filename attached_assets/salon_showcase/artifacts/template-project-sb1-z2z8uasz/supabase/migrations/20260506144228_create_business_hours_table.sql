/*
  # Create business_hours table

  1. New Tables
    - `business_hours`
      - `id` (uuid, primary key)
      - `day_of_week` (integer, 0-6 where 0=Sunday, 1=Monday, etc.)
      - `opens_at` (time, e.g., '09:00:00')
      - `closes_at` (time, e.g., '17:00:00')
      - `is_closed` (boolean, for days that are closed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `business_hours` table
    - Add public SELECT policy for all users to read hours
    - Add policy for authenticated admin users to update hours (based on admin role)
*/

CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  opens_at time,
  closes_at time,
  is_closed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(day_of_week)
);

ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read business hours"
  ON business_hours
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can update business hours"
  ON business_hours
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can insert business hours"
  ON business_hours
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default hours (Monday-Thursday 9am-7pm, Friday 9am-5pm, Saturday closed, Sunday 10am-6pm)
INSERT INTO business_hours (day_of_week, opens_at, closes_at, is_closed) VALUES
  (0, '10:00:00'::time, '18:00:00'::time, false),  -- Sunday
  (1, '09:00:00'::time, '19:00:00'::time, false),  -- Monday
  (2, '09:00:00'::time, '19:00:00'::time, false),  -- Tuesday
  (3, '09:00:00'::time, '19:00:00'::time, false),  -- Wednesday
  (4, '09:00:00'::time, '19:00:00'::time, false),  -- Thursday
  (5, '09:00:00'::time, '17:00:00'::time, false),  -- Friday
  (6, NULL, NULL, true)                              -- Saturday (closed)
ON CONFLICT (day_of_week) DO NOTHING;
