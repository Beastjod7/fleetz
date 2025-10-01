-- Create trip_locations table to track real-time vehicle/trip locations
CREATE TABLE IF NOT EXISTS public.trip_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  speed NUMERIC,
  heading NUMERIC,
  accuracy NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trip_locations ENABLE ROW LEVEL SECURITY;

-- Admins can view all locations
CREATE POLICY "Admins can view all trip locations" 
ON public.trip_locations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Employees can view locations for their assigned trips
CREATE POLICY "Employees can view their trip locations" 
ON public.trip_locations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_locations.trip_id 
    AND trips.assigned_employee_id = auth.uid()
  )
);

-- Employees can insert locations for their assigned trips
CREATE POLICY "Employees can insert their trip locations" 
ON public.trip_locations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_locations.trip_id 
    AND trips.assigned_employee_id = auth.uid()
    AND trips.status = 'in_progress'
  )
);

-- Create index for faster queries
CREATE INDEX idx_trip_locations_trip_id ON public.trip_locations(trip_id);
CREATE INDEX idx_trip_locations_recorded_at ON public.trip_locations(recorded_at DESC);

-- Enable realtime for live tracking
ALTER TABLE public.trip_locations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_locations;