import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, CheckCircle, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TripDetailsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [stats, setStats] = useState({
    tripsToday: 0,
    completed: 0,
    hoursDriven: 0
  });
  const [todayTrips, setTodayTrips] = useState<any[]>([]);
  const [completedTrips, setCompletedTrips] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/employee/login");
        return;
      }

      // Fetch available vehicles
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available');
      setVehicles(vehiclesData || []);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch today's trips
      const { data: todayData } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(name, start_location, end_location),
          vehicle:vehicles(make, model, license_plate)
        `)
        .eq('assigned_employee_id', user.id)
        .gte('scheduled_start_time', today.toISOString())
        .order('scheduled_start_time', { ascending: true });
      setTodayTrips(todayData || []);

      // Fetch completed trips
      const { data: completedData } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(name, start_location, end_location),
          vehicle:vehicles(make, model, license_plate)
        `)
        .eq('assigned_employee_id', user.id)
        .eq('status', 'completed')
        .gte('actual_end_time', today.toISOString())
        .order('actual_end_time', { ascending: false });
      setCompletedTrips(completedData || []);

      // Calculate hours driven
      const hoursDriven = completedData?.reduce((total, trip) => {
        if (trip.actual_start_time && trip.actual_end_time) {
          const start = new Date(trip.actual_start_time);
          const end = new Date(trip.actual_end_time);
          return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }
        return total;
      }, 0) || 0;

      setStats({
        tripsToday: todayData?.length || 0,
        completed: completedData?.length || 0,
        hoursDriven: parseFloat(hoursDriven.toFixed(1))
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trip details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = async () => {
    if (!selectedVehicle) {
      toast({
        title: "Error",
        description: "Please select a vehicle",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update vehicle status to in_use
      const { error } = await supabase
        .from('vehicles')
        .update({ status: 'in_use' })
        .eq('id', selectedVehicle);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle selected successfully",
      });

      fetchData();
    } catch (error) {
      console.error('Error selecting vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to select vehicle",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b bg-gradient-card backdrop-blur-lg border-border/50">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/employee/dashboard")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-semibold">Trip Details</h1>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trips Today</p>
                  <p className="text-3xl font-bold">{stats.tripsToday}</p>
                </div>
                <MapPin className="h-8 w-8 text-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hours Driven</p>
                  <p className="text-3xl font-bold">{stats.hoursDriven}</p>
                </div>
                <Clock className="h-8 w-8 text-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Selection */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Select Vehicle
            </CardTitle>
            <CardDescription>Choose a vehicle for your trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="vehicle">Available Vehicles</Label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleVehicleSelect} className="mt-8">Select</Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Trips */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Trips</CardTitle>
            <CardDescription>All trips scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : todayTrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No trips today</div>
            ) : (
              <div className="space-y-4">
                {todayTrips.map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{trip.route?.name || 'No route'}</h3>
                      <Badge variant={trip.status === 'completed' ? 'default' : 'secondary'}>
                        {trip.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-muted-foreground">Scheduled: {new Date(trip.scheduled_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-muted-foreground">Vehicle: {trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model}` : 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Trips */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Trips Today</CardTitle>
            <CardDescription>Trips you've completed today</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : completedTrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No completed trips</div>
            ) : (
              <div className="space-y-4">
                {completedTrips.map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{trip.route?.name || 'No route'}</h3>
                      <Badge>COMPLETED</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-muted-foreground">
                        Duration: {trip.actual_start_time && trip.actual_end_time ? formatDuration(trip.actual_start_time, trip.actual_end_time) : 'N/A'}
                      </p>
                      <p className="text-muted-foreground">Vehicle: {trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model}` : 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripDetailsPage;
