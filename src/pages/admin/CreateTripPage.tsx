import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, User, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  license_plate: string;
  status: string;
}

interface Route {
  id: string;
  name: string;
  start_location: string;
  end_location: string;
  distance_km: number | null;
  estimated_duration_minutes: number | null;
}

const CreateTripPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);

  const [formData, setFormData] = useState({
    assigned_employee_id: "",
    vehicle_id: "",
    route_id: "",
    scheduled_start_time: "",
    scheduled_end_time: "",
    notes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch employees
      const { data: employeeRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'employee');

      if (employeeRoles) {
        const userIds = employeeRoles.map(role => role.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', userIds);
        setEmployees(profiles || []);
      }

      // Fetch available vehicles
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('id, make, model, license_plate, status')
        .eq('status', 'available');
      setVehicles(vehiclesData || []);

      // Fetch active routes
      const { data: routesData } = await supabase
        .from('routes')
        .select('id, name, start_location, end_location, distance_km, estimated_duration_minutes')
        .eq('is_active', true);
      setRoutes(routesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('trips')
        .insert({
          assigned_employee_id: formData.assigned_employee_id || null,
          vehicle_id: formData.vehicle_id,
          route_id: formData.route_id,
          scheduled_start_time: formData.scheduled_start_time,
          scheduled_end_time: formData.scheduled_end_time,
          notes: formData.notes || null,
          assigned_by_admin_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trip created successfully",
      });

      navigate("/admin/trips");
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employee: Employee) => {
    if (employee.first_name && employee.last_name) {
      return `${employee.first_name} ${employee.last_name}`;
    }
    return employee.first_name || employee.last_name || employee.email;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b bg-gradient-card backdrop-blur-lg border-border/50">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-semibold">Create New Trip</h1>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <MapPin className="h-6 w-6 mr-2" />
              Trip Details
            </CardTitle>
            <CardDescription className="text-lg">
              Create and assign a new trip to your fleet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="route">Route *</Label>
                  <Select value={formData.route_id} onValueChange={(value) => setFormData(prev => ({ ...prev, route_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{route.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {route.start_location} → {route.end_location}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle *</Label>
                  <Select value={formData.vehicle_id} onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_id: value }))}>
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

                <div className="space-y-2">
                  <Label htmlFor="employee">Assign Employee (Optional)</Label>
                  <Select value={formData.assigned_employee_id} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_employee_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.user_id} value={employee.user_id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{getEmployeeName(employee)}</span>
                            <span className="text-sm text-muted-foreground">{employee.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_time">Scheduled Start Time *</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.scheduled_start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_start_time: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">Scheduled End Time *</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.scheduled_end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_end_time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes or instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate("/admin/dashboard")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Trip"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTripPage;