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

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/admin/login");
  };

  const stats = [
    { title: "Total Vehicles", value: "24", icon: Car, color: "text-blue-600" },
    { title: "Active Employees", value: "18", icon: Users, color: "text-green-600" },
    { title: "Active Trips", value: "7", icon: MapPin, color: "text-orange-600" },
    { title: "Completed Today", value: "12", icon: Activity, color: "text-purple-600" },
  ];

  const recentTrips = [
    { id: "T001", driver: "John Doe", route: "Route A-B", status: "In Progress", vehicle: "VH-001" },
    { id: "T002", driver: "Jane Smith", route: "Route C-D", status: "Completed", vehicle: "VH-003" },
    { id: "T003", driver: "Mike Johnson", route: "Route E-F", status: "Pending", vehicle: "VH-007" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your fleet operations efficiently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-20 flex-col space-y-2">
                <Plus className="h-5 w-5" />
                <span>Create Trip</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Users className="h-5 w-5" />
                <span>Manage Employees</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Car className="h-5 w-5" />
                <span>Manage Vehicles</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <MapPin className="h-5 w-5" />
                <span>Manage Routes</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Trips */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
            <CardDescription>
              Latest trip activities and status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
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