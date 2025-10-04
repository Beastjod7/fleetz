import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertCircle,
  User,
  LogOut,
  Bell
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import LiveUpdates from "@/components/LiveUpdates";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignedTrips, setAssignedTrips] = useState<any[]>([]);
  const [completedTrips, setCompletedTrips] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { title: "Trips Today", value: "0", icon: MapPin, color: "text-foreground", bgColor: "bg-muted/20" },
    { title: "Completed", value: "0", icon: CheckCircle, color: "text-muted-foreground", bgColor: "bg-muted/30" },
    { title: "Hours Driven", value: "0", icon: Clock, color: "text-foreground", bgColor: "bg-muted/25" },
  ]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchEmployeeDashboardData();
  }, []);

  const fetchEmployeeDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/employee/login");
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserProfile(profile);

      // Fetch assigned trips (pending and in progress)
      const { data: tripsData } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(name, start_location, end_location),
          vehicle:vehicles(make, model, license_plate)
        `)
        .eq('assigned_employee_id', user.id)
        .in('status', ['pending', 'in_progress'])
        .order('scheduled_start_time', { ascending: true });

      setAssignedTrips(tripsData || []);

      // Fetch completed trips
      const { data: completedData } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(name, start_location, end_location)
        `)
        .eq('assigned_employee_id', user.id)
        .eq('status', 'completed')
        .order('actual_end_time', { ascending: false })
        .limit(5);

      setCompletedTrips(completedData || []);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayTripsCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_employee_id', user.id)
        .gte('scheduled_start_time', today.toISOString());

      const { count: completedCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_employee_id', user.id)
        .eq('status', 'completed')
        .gte('actual_end_time', today.toISOString());

      // Calculate hours driven today
      const { data: completedTodayTrips } = await supabase
        .from('trips')
        .select('actual_start_time, actual_end_time')
        .eq('assigned_employee_id', user.id)
        .eq('status', 'completed')
        .gte('actual_end_time', today.toISOString())
        .not('actual_start_time', 'is', null)
        .not('actual_end_time', 'is', null);

      const hoursDriven = completedTodayTrips?.reduce((total, trip) => {
        const start = new Date(trip.actual_start_time!);
        const end = new Date(trip.actual_end_time!);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0) || 0;

      setStats([
        { title: "Trips Today", value: todayTripsCount?.toString() || "0", icon: MapPin, color: "text-foreground", bgColor: "bg-muted/20" },
        { title: "Completed", value: completedCount?.toString() || "0", icon: CheckCircle, color: "text-muted-foreground", bgColor: "bg-muted/30" },
        { title: "Hours Driven", value: hoursDriven.toFixed(1), icon: Clock, color: "text-foreground", bgColor: "bg-muted/25" },
      ]);

    } catch (error) {
      console.error('Error fetching employee dashboard data:', error);
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
    navigate("/employee/login");
  };

  const handleStartTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ 
          status: 'in_progress',
          actual_start_time: new Date().toISOString()
        })
        .eq('id', tripId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trip started successfully",
      });

      fetchEmployeeDashboardData();
    } catch (error) {
      console.error('Error starting trip:', error);
      toast({
        title: "Error",
        description: "Failed to start trip",
        variant: "destructive",
      });
    }
  };

  const handleCompleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ 
          status: 'completed',
          actual_end_time: new Date().toISOString()
        })
        .eq('id', tripId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trip completed successfully",
      });

      fetchEmployeeDashboardData();
    } catch (error) {
      console.error('Error completing trip:', error);
      toast({
        title: "Error",
        description: "Failed to complete trip",
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
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`;
  };

  const getInitials = (profile: any) => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return profile?.email?.[0]?.toUpperCase() || 'U';
  };

  const getFullName = (profile: any) => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile?.email || 'Employee';
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-gradient-card backdrop-blur-lg border-border/50">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>{getInitials(userProfile)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">Welcome back, {getFullName(userProfile)}</h1>
              <p className="text-sm text-muted-foreground">
                {userProfile?.email || 'Loading...'}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:scale-105 transition-all duration-300">
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
            <LiveMap employeeId="emp001" />
          </div>
          <div>
            <LiveUpdates employeeId="emp001" />
          </div>
        </div>

        {/* Assigned Trips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Assigned Trips
            </CardTitle>
            <CardDescription>
              Your current and upcoming trip assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading trips...</div>
            ) : assignedTrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No trips assigned
              </div>
            ) : (
              <div className="space-y-4">
                {assignedTrips.map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{trip.id.slice(0, 8)}</h3>
                        <Badge variant={trip.status === "in_progress" ? "default" : "secondary"}>
                          {trip.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {trip.status === "pending" && (
                          <Button size="sm" onClick={() => handleStartTrip(trip.id)}>Start Trip</Button>
                        )}
                        {trip.status === "in_progress" && (
                          <Button size="sm" variant="outline" onClick={() => handleCompleteTrip(trip.id)}>Complete Trip</Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Route</p>
                        <p className="font-medium">{trip.route?.name || 'No route'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Scheduled</p>
                        <p className="font-medium">
                          {new Date(trip.scheduled_start_time).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Vehicle</p>
                        <p className="font-medium">
                          {trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">From → To</p>
                        <p className="font-medium text-xs">
                          {trip.route?.start_location} → {trip.route?.end_location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Completed Trips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recent Completed Trips
            </CardTitle>
            <CardDescription>
              Your recently completed trip history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading history...</div>
            ) : completedTrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed trips yet
              </div>
            ) : (
              <div className="space-y-3">
                {completedTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{trip.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{trip.route?.name || 'No route'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {trip.actual_end_time ? new Date(trip.actual_end_time).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {trip.actual_start_time && trip.actual_end_time 
                          ? formatDuration(trip.actual_start_time, trip.actual_end_time)
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={() => navigate("/employee/profile")}>Update Profile</Button>
              <Button variant="outline" onClick={() => navigate("/employee/trip-details")}>Trip Details</Button>
              <Button variant="outline" onClick={() => navigate("/employee/trip-history")}>View Trip History</Button>
              <Button variant="outline" onClick={() => navigate("/employee/feedback")}>Submit Feedback</Button>
              <Button variant="outline" onClick={() => navigate("/employee/live-updates")}>Live Updates</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;