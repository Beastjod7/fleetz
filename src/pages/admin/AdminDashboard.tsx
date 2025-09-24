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

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/admin/login");
  };

  const stats = [
    { title: "Total Vehicles", value: "24", icon: Car, color: "text-primary", bgColor: "bg-primary/10", path: "/admin/vehicles" },
    { title: "Active Employees", value: "18", icon: Users, color: "text-secondary", bgColor: "bg-secondary/10", path: "/admin/employees" },
    { title: "Active Trips", value: "7", icon: MapPin, color: "text-warning", bgColor: "bg-warning/10", path: "/admin/trips" },
    { title: "Completed Today", value: "12", icon: Activity, color: "text-success", bgColor: "bg-success/10", path: "/admin/trips" },
  ];

  const recentTrips = [
    { id: "T001", driver: "John Doe", route: "Route A-B", status: "In Progress", vehicle: "VH-001" },
    { id: "T002", driver: "Jane Smith", route: "Route C-D", status: "Completed", vehicle: "VH-003" },
    { id: "T003", driver: "Mike Johnson", route: "Route E-F", status: "Pending", vehicle: "VH-007" },
  ];

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
              <Button className="h-24 flex-col space-y-3 text-lg">
                <Plus className="h-6 w-6" />
                <span>Create Trip</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col space-y-3 text-lg hover:bg-secondary/10 hover:border-secondary/40">
                <Users className="h-6 w-6" />
                <span>Manage Employees</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col space-y-3 text-lg hover:bg-warning/10 hover:border-warning/40">
                <Car className="h-6 w-6" />
                <span>Manage Vehicles</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col space-y-3 text-lg hover:bg-success/10 hover:border-success/40">
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
            <div className="space-y-6">
              {recentTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-6 border rounded-xl bg-gradient-card hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="font-medium">{trip.id}</p>
                      <p className="text-sm text-muted-foreground">{trip.driver}</p>
                    </div>
                    <div>
                      <p className="text-sm">{trip.route}</p>
                      <p className="text-sm text-muted-foreground">Vehicle: {trip.vehicle}</p>
                    </div>
                  </div>
                  <Badge variant={
                    trip.status === "Completed" ? "default" :
                    trip.status === "In Progress" ? "secondary" : "outline"
                  }>
                    {trip.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;