import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Trip {
  id: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  actual_start_time: string | null;
  actual_end_time: string | null;
  status: string;
  notes: string | null;
  trip_log: string | null;
  assigned_employee: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  route: {
    name: string;
    start_location: string;
    end_location: string;
  } | null;
  vehicle: {
    make: string;
    model: string;
    license_plate: string;
  } | null;
}

const TripsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          assigned_employee:profiles!trips_assigned_employee_id_fkey(first_name, last_name, email),
          route:routes(name, start_location, end_location),
          vehicle:vehicles(make, model, license_plate)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trips",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTrips = () => {
    let filtered = trips;

    // Filter by tab
    if (activeTab === "active") {
      filtered = trips.filter(trip => trip.status === 'in_progress' || trip.status === 'pending');
    } else if (activeTab === "completed") {
      filtered = trips.filter(trip => trip.status === 'completed');
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(trip =>
        trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.assigned_employee?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.route?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.vehicle?.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
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

  const getEmployeeName = (employee: Trip['assigned_employee']) => {
    if (!employee) return 'Unassigned';
    if (employee.first_name && employee.last_name) {
      return `${employee.first_name} ${employee.last_name}`;
    }
    return employee.first_name || employee.last_name || employee.email;
  };

  const filteredTrips = getFilteredTrips();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b bg-gradient-card backdrop-blur-lg border-border/50">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-semibold">Trip Management</h1>
          <div className="ml-auto flex items-center space-x-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Trip
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        <Card className="border-warning/20">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  <MapPin className="h-6 w-6 mr-2" />
                  Trip Management
                </CardTitle>
                <CardDescription className="text-lg">
                  Monitor and manage all trips across your fleet
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Trips</TabsTrigger>
                <TabsTrigger value="active">Active Trips</TabsTrigger>
                <TabsTrigger value="completed">Completed Today</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">Loading trips...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trip ID</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Scheduled Time</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrips.map((trip) => (
                        <TableRow key={trip.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono">{trip.id.slice(0, 8)}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{getEmployeeName(trip.assigned_employee)}</p>
                              <p className="text-sm text-muted-foreground">{trip.assigned_employee?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{trip.route?.name || 'No route'}</p>
                              <p className="text-sm text-muted-foreground">
                                {trip.route?.start_location} → {trip.route?.end_location}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {trip.vehicle ? 
                              `${trip.vehicle.make} ${trip.vehicle.model} (${trip.vehicle.license_plate})` : 
                              'No vehicle'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(trip.status)}>
                              {trip.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">
                                {new Date(trip.scheduled_start_time).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(trip.scheduled_start_time).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {!loading && filteredTrips.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No trips found matching your criteria.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripsPage;