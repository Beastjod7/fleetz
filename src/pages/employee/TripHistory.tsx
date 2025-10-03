import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, History, MapPin, Calendar, Clock, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TripHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trips, setTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTripHistory();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = trips.filter(trip => 
        trip.route?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.vehicle?.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.vehicle?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.status?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTrips(filtered);
    } else {
      setFilteredTrips(trips);
    }
  }, [searchQuery, trips]);

  const fetchTripHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/employee/login");
        return;
      }

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(name, start_location, end_location, distance_km),
          vehicle:vehicles(make, model, license_plate)
        `)
        .eq('assigned_employee_id', user.id)
        .order('scheduled_start_time', { ascending: false });

      if (error) throw error;

      setTrips(data || []);
      setFilteredTrips(data || []);
    } catch (error) {
      console.error('Error fetching trip history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trip history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return 'N/A';
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
          <Button variant="ghost" size="sm" onClick={() => navigate("/employee/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Trip History
                </CardTitle>
                <CardDescription>
                  View all your past and current trips
                </CardDescription>
              </div>
              <Badge variant="outline">{filteredTrips.length} trips</Badge>
            </div>
            <div className="mt-4">
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by route, vehicle, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading trip history...</div>
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No trips found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTrips.map((trip) => (
                  <Card key={trip.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Trip #{trip.id.slice(0, 8)}</h3>
                          <Badge variant={getStatusColor(trip.status)}>
                            {trip.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {new Date(trip.scheduled_start_time).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Route
                          </p>
                          <p className="font-medium">{trip.route?.name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">
                            {trip.route?.start_location} → {trip.route?.end_location}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground">Vehicle</p>
                          <p className="font-medium">
                            {trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model}` : 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {trip.vehicle?.license_plate || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Duration
                          </p>
                          <p className="font-medium">
                            {formatDuration(trip.actual_start_time, trip.actual_end_time)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {trip.route?.distance_km ? `${trip.route.distance_km} km` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {trip.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">Notes</p>
                          <p className="text-sm">{trip.notes}</p>
                        </div>
                      )}

                      {trip.trip_log && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Trip Log</p>
                          <p className="text-sm">{trip.trip_log}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripHistory;
