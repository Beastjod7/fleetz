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

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/employee/login");
  };

  const assignedTrips = [
    { 
      id: "T001", 
      route: "Downtown → Airport", 
      status: "Pending", 
      scheduledTime: "09:00 AM",
      vehicle: "VH-001",
      estimatedDuration: "2 hours"
    },
    { 
      id: "T005", 
      route: "Mall → Warehouse", 
      status: "In Progress", 
      scheduledTime: "02:00 PM",
      vehicle: "VH-003",
      estimatedDuration: "1.5 hours"
    },
  ];

  const completedTrips = [
    { 
      id: "T002", 
      route: "Office → Hotel", 
      completedAt: "Yesterday 4:30 PM",
      duration: "45 minutes"
    },
    { 
      id: "T003", 
      route: "Station → Mall", 
      completedAt: "Yesterday 2:15 PM",
      duration: "1 hour"
    },
  ];

  const stats = [
    { title: "Trips Today", value: "2", icon: MapPin, color: "text-primary", bgColor: "bg-primary/10" },
    { title: "Completed", value: "1", icon: CheckCircle, color: "text-success", bgColor: "bg-success/10" },
    { title: "Hours Driven", value: "3.2", icon: Clock, color: "text-warning", bgColor: "bg-warning/10" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-gradient-card backdrop-blur-lg border-border/50">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">Welcome back, John Doe</h1>
              <p className="text-sm text-muted-foreground">Employee ID: EMP001</p>
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
            <div className="space-y-4">
              {assignedTrips.map((trip) => (
                <div key={trip.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{trip.id}</h3>
                      <Badge variant={trip.status === "In Progress" ? "default" : "secondary"}>
                        {trip.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {trip.status === "Pending" && (
                        <Button size="sm">Start Trip</Button>
                      )}
                      {trip.status === "In Progress" && (
                        <Button size="sm" variant="outline">Complete Trip</Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Route</p>
                      <p className="font-medium">{trip.route}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Scheduled</p>
                      <p className="font-medium">{trip.scheduledTime}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{trip.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{trip.estimatedDuration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-3">
              {completedTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{trip.id}</p>
                    <p className="text-sm text-muted-foreground">{trip.route}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{trip.completedAt}</p>
                    <p className="text-sm text-muted-foreground">{trip.duration}</p>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="flex gap-4">
              <Button variant="outline">Update Profile</Button>
              <Button variant="outline">View Trip History</Button>
              <Button variant="outline">Submit Feedback</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;