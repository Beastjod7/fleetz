import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Car, 
  Users, 
  MapPin, 
  Activity,
  Plus,
  LogOut
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import LiveUpdates from "@/components/LiveUpdates";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState([
    { title: "Total Vehicles", value: "0", icon: Car, color: "text-foreground", bgColor: "bg-muted/20", path: "/admin/vehicles" },
    { title: "Active Employees", value: "0", icon: Users, color: "text-muted-foreground", bgColor: "bg-muted/30", path: "/admin/employees" },
    { title: "Active Trips", value: "0", icon: MapPin, color: "text-foreground", bgColor: "bg-muted/25", path: "/admin/trips" },
    { title: "Completed Today", value: "0", icon: Activity, color: "text-muted-foreground", bgColor: "bg-muted/35", path: "/admin/trips" },
  ]);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch vehicle count
      const { count: vehicleCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });

      // Fetch employee count
      const { data: employeeRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'employee');

      // Fetch active trips
      const { count: activeTripsCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress']);

      // Fetch completed trips today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: completedTodayCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('actual_end_time', today.toISOString());

      // Fetch recent trips
      const { data: tripsData } = await supabase
        .from('trips')
        .select(`
          *,
          assigned_employee:profiles!trips_assigned_employee_id_fkey(first_name, last_name, email),
          route:routes(name),
          vehicle:vehicles(make, model, license_plate)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      setStats([
        { title: "Total Vehicles", value: vehicleCount?.toString() || "0", icon: Car, color: "text-foreground", bgColor: "bg-muted/20", path: "/admin/vehicles" },
        { title: "Active Employees", value: employeeRoles?.length.toString() || "0", icon: Users, color: "text-muted-foreground", bgColor: "bg-muted/30", path: "/admin/employees" },
        { title: "Active Trips", value: activeTripsCount?.toString() || "0", icon: MapPin, color: "text-foreground", bgColor: "bg-muted/25", path: "/admin/trips" },
        { title: "Completed Today", value: completedTodayCount?.toString() || "0", icon: Activity, color: "text-muted-foreground", bgColor: "bg-muted/35", path: "/admin/trips" },
      ]);

      setRecentTrips(tripsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate("/admin/login");
  };

  const getEmployeeName = (employee: any) => {
    if (!employee) return 'Unassigned';
    if (employee.first_name && employee.last_name) {
      return `${employee.first_name} ${employee.last_name}`;
    }
    return employee.first_name || employee.last_name || employee.email;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-gradient-card backdrop-blur-lg border-border/50">
        <div className="flex h-16 items-center px-4 md:px-6">
          <h1 className="text-xl font-semibold">Fleet Management - Admin</h1>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card 
              key={stat.title} 
              className="hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => navigate(stat.path)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Tracking Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LiveMap isAdmin={true} />
          </div>
          <div>
            <LiveUpdates isAdmin={true} />
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
            <CardDescription className="text-lg">
              Manage your fleet operations efficiently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Button 
                className="h-24 flex-col space-y-3 text-lg"
                onClick={() => navigate("/admin/create-trip")}
              >
                <Plus className="h-6 w-6" />
                <span>Create Trip</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col space-y-3 text-lg hover:bg-secondary/10 hover:border-secondary/40"
                onClick={() => navigate("/admin/employees")}
              >
                <Users className="h-6 w-6" />
                <span>Manage Employees</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col space-y-3 text-lg hover:bg-warning/10 hover:border-warning/40"
                onClick={() => navigate("/admin/manage-vehicles")}
              >
                <Car className="h-6 w-6" />
                <span>Manage Vehicles</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col space-y-3 text-lg hover:bg-success/10 hover:border-success/40"
                onClick={() => navigate("/admin/manage-routes")}
              >
                <MapPin className="h-6 w-6" />
                <span>Manage Routes</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Trips */}
        <Card className="border-secondary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Trips</CardTitle>
            <CardDescription className="text-lg">
              Latest trip activities and status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading trips...</div>
            ) : recentTrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No trips found
              </div>
            ) : (
              <div className="space-y-6">
                {recentTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-6 border rounded-xl bg-gradient-card hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-6">
                      <div>
                        <p className="font-medium">{trip.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{getEmployeeName(trip.assigned_employee)}</p>
                      </div>
                      <div>
                        <p className="text-sm">{trip.route?.name || 'No route'}</p>
                        <p className="text-sm text-muted-foreground">
                          Vehicle: {trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      trip.status === "completed" ? "default" :
                      trip.status === "in_progress" ? "secondary" : "outline"
                    }>
                      {trip.status.replace('_', ' ').toUpperCase()}
                    </Badge>
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

export default AdminDashboard;