/*
  # Update trips table to support route_name

  1. Changes
    - Add `route_name` column to trips table as TEXT
    - Make `route_id` column nullable to allow trips without predefined routes
    - Add check constraint to ensure either route_id or route_name is provided

  2. Purpose
    - Allows flexible trip creation with either a predefined route or a custom route name
    - Maintains backward compatibility with existing trips that use route_id

  3. Security
    - No changes to RLS policies (existing policies still apply)
*/

-- Add route_name column to trips table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'route_name'
  ) THEN
    ALTER TABLE public.trips ADD COLUMN route_name TEXT;
  END IF;
END $$;

-- Make route_id nullable to allow trips with just a route name
DO $$
BEGIN
  ALTER TABLE public.trips ALTER COLUMN route_id DROP NOT NULL;
EXCEPTION
  WHEN others THEN
    NULL;
END $$;

-- Add constraint to ensure at least one of route_id or route_name is provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'trips_route_check'
  ) THEN
    ALTER TABLE public.trips
    ADD CONSTRAINT trips_route_check
    CHECK (route_id IS NOT NULL OR route_name IS NOT NULL);
  END IF;
END $$;
