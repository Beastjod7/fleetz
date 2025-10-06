import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Clock, User, Car, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TripDetail {
  id: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  actual_start_time: string | null;
  actual_end_time: string | null;
  status: string;
  notes: string | null;
  trip_log: string | null;
  hours_driven: number | null;
  route: {
    name: string;
    start_location: string;
    end_location: string;
    distance_km: number | null;
  } | null;
  assigned_employee: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
  } | null;
  vehicle: {
    make: string;
    model: string;
    license_plate: string;
    year: number;
  } | null;
}

const TripDetailPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('id');
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) {
      navigate('/admin/trips');
      return;
    }
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(name, start_location, end_location, distance_km),
          assigned_employee:profiles!trips_assigned_employee_id_fkey(first_name, last_name, email, phone),
          vehicle:vehicles(make, model, license_plate, year)
        `)
        .eq('id', tripId)
        .single();

      if (error) throw error;
      setTrip(data);
    } catch (error) {
      console.error('Error fetching trip details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trip details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'in_progress': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getEmployeeName = (employee: TripDetail['assigned_employee']) => {
    if (!employee) return 'Unassigned';
    if (employee.first_name && employee.last_name) {
      return `${employee.first_name} ${employee.last_name}`;
    }
    return employee.first_name || employee.last_name || employee.email;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-lg">Loading trip details...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-lg mb-4">Trip not found</p>
            <Button onClick={() => navigate('/admin/trips')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Trips
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b bg-gradient-card backdrop-blur-lg border-border/50">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/trips")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trips
          </Button>
          <h1 className="text-xl font-semibold">Trip Details</h1>
        </div>
      </header>

      <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
        <Card className="border-warning/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center">
                <MapPin className="h-6 w-6 mr-2" />
                Trip #{trip.id.slice(0, 8)}
              </CardTitle>
              <Badge variant={getStatusColor(trip.status)}>
                {trip.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Route Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Route Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Route Name</p>
                  <p className="font-medium">{trip.route?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="font-medium">{trip.route?.distance_km ? `${trip.route.distance_km} km` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Location</p>
                  <p className="font-medium">{trip.route?.start_location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Location</p>
                  <p className="font-medium">{trip.route?.end_location || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Assigned Employee
              </h3>
              <div className="grid md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{getEmployeeName(trip.assigned_employee)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{trip.assigned_employee?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{trip.assigned_employee?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Vehicle
              </h3>
              <div className="grid md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-medium">
                    {trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model} (${trip.vehicle.year})` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-medium">{trip.vehicle?.license_plate || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule
              </h3>
              <div className="grid md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled Start</p>
                  <p className="font-medium">{new Date(trip.scheduled_start_time).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled End</p>
                  <p className="font-medium">{new Date(trip.scheduled_end_time).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Actual Start</p>
                  <p className="font-medium">
                    {trip.actual_start_time ? new Date(trip.actual_start_time).toLocaleString() : 'Not started'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Actual End</p>
                  <p className="font-medium">
                    {trip.actual_end_time ? new Date(trip.actual_end_time).toLocaleString() : 'Not completed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Hours Driven */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Hours Driven (Manual Entry)
              </h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Employee Reported Hours</p>
                <p className="text-2xl font-bold">
                  {trip.hours_driven ? `${Math.floor(trip.hours_driven / 24)}d ${(trip.hours_driven % 24).toFixed(1)}h` : 'Not set'}
                </p>
              </div>
            </div>

            {/* Notes and Logs */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Notes & Logs
              </h3>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Admin Notes</p>
                  <p className="font-medium">{trip.notes || 'No notes available'}</p>
                </div>
                {trip.trip_log && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Trip Log</p>
                    <p className="font-medium whitespace-pre-wrap">{trip.trip_log}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripDetailPage;
