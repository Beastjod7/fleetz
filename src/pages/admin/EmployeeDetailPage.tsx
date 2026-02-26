import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar, MapPin, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EmployeeDetail {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
}

interface Trip {
  id: string;
  status: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  actual_start_time: string | null;
  actual_end_time: string | null;
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

const EmployeeDetailPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeDetails();
      fetchEmployeeTrips();
      fetchTotalTripsCount();
    }
  }, [employeeId]);

  const fetchEmployeeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', employeeId)
        .single();

      if (error) throw error;
      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employee details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(name, start_location, end_location),
          vehicle:vehicles(make, model, license_plate)
        `)
        .eq('assigned_employee_id', employeeId)
        .order('scheduled_start_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching employee trips:', error);
    }
  };

  const fetchTotalTripsCount = async () => {
    try {
      const { count, error } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_employee_id', employeeId);

      if (error) throw error;
      setTotalTrips(count || 0);
    } catch (error) {
      console.error('Error fetching total trips count:', error);
    }
  };

  const getFullName = () => {
    if (!employee) return 'N/A';
    if (employee.first_name && employee.last_name) {
      return `${employee.first_name} ${employee.last_name}`;
    }
    return employee.first_name || employee.last_name || 'N/A';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: "default",
      in_progress: "secondary",
      pending: "outline",
    };
    return statusMap[status] || "outline";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-lg">Loading employee details...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Employee not found</p>
            <Button className="w-full mt-4" onClick={() => navigate("/admin/employees")}>
              Back to Employees
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
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/employees")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
          <h1 className="text-xl font-semibold">Employee Details</h1>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        {/* Employee Information Card */}
        <Card className="border-secondary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl">{getFullName()}</CardTitle>
                  <CardDescription className="text-lg">
                    Employee ID: {employee.user_id.slice(0, 8)}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{employee.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p className="font-medium">{new Date(employee.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Trips</p>
                  <p className="font-medium">{totalTrips}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip History Card */}
        <Card className="border-secondary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Trip History</CardTitle>
            <CardDescription className="text-lg">
              Recent trips assigned to this employee
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No trips found for this employee
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Scheduled Start</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{trip.route?.name || 'No route'}</p>
                          <p className="text-sm text-muted-foreground">
                            {trip.route?.start_location} → {trip.route?.end_location}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {trip.vehicle ? (
                          <div>
                            <p className="font-medium">{trip.vehicle.make} {trip.vehicle.model}</p>
                            <p className="text-sm text-muted-foreground">{trip.vehicle.license_plate}</p>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(trip.scheduled_start_time).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(trip.status) as any}>
                          {trip.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDetailPage;
