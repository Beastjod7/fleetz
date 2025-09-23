-- Create enum for vehicle status
CREATE TYPE public.vehicle_status AS ENUM ('available', 'in_use', 'maintenance', 'out_of_service');

-- Create enum for trip status
CREATE TYPE public.trip_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'delayed');

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_plate TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  fuel_type TEXT DEFAULT 'gasoline',
  status vehicle_status NOT NULL DEFAULT 'available',
  mileage INTEGER DEFAULT 0,
  last_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create routes table
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  distance_km DECIMAL(10,2),
  estimated_duration_minutes INTEGER,
  waypoints JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trips table
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  assigned_employee_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  assigned_by_admin_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  status trip_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  trip_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicles
CREATE POLICY "Admins can manage all vehicles" 
ON public.vehicles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can view vehicles" 
ON public.vehicles 
FOR SELECT 
USING (has_role(auth.uid(), 'employee'::app_role));

-- RLS Policies for routes
CREATE POLICY "Admins can manage all routes" 
ON public.routes 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can view active routes" 
ON public.routes 
FOR SELECT 
USING (has_role(auth.uid(), 'employee'::app_role) AND is_active = true);

-- RLS Policies for trips
CREATE POLICY "Admins can manage all trips" 
ON public.trips 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can view their assigned trips" 
ON public.trips 
FOR SELECT 
USING (has_role(auth.uid(), 'employee'::app_role) AND assigned_employee_id = auth.uid());

CREATE POLICY "Employees can update their trip status and logs" 
ON public.trips 
FOR UPDATE 
USING (has_role(auth.uid(), 'employee'::app_role) AND assigned_employee_id = auth.uid())
WITH CHECK (has_role(auth.uid(), 'employee'::app_role) AND assigned_employee_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routes_updated_at
BEFORE UPDATE ON public.routes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically notify employees when assigned to trips
CREATE OR REPLACE FUNCTION public.notify_employee_trip_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create notification if employee is assigned
  IF NEW.assigned_employee_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      trip_id,
      title,
      message,
      type
    ) VALUES (
      NEW.assigned_employee_id,
      NEW.id,
      'New Trip Assignment',
      'You have been assigned to a new trip scheduled for ' || NEW.scheduled_start_time::text,
      'trip_assignment'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for trip assignment notifications
CREATE TRIGGER notify_on_trip_assignment
AFTER INSERT ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.notify_employee_trip_assignment();

-- Create indexes for better performance
CREATE INDEX idx_trips_assigned_employee ON public.trips(assigned_employee_id);
CREATE INDEX idx_trips_vehicle ON public.trips(vehicle_id);
CREATE INDEX idx_trips_route ON public.trips(route_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);