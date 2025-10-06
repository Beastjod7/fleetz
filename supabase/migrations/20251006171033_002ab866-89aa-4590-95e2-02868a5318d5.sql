-- Add hours_driven column to trips table for manual tracking
ALTER TABLE public.trips 
ADD COLUMN hours_driven numeric DEFAULT 0;