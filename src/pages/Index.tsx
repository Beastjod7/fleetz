import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="text-center space-y-8 p-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Fleet Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive fleet management solution with separate portals for administrators and employees
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/admin/login")}>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle className="text-2xl">Admin Portal</CardTitle>
              <CardDescription>
                Manage trips, vehicles, employees, and routes. Full administrative control over fleet operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Access Admin Portal
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/employee/login")}>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-secondary mb-4" />
              <CardTitle className="text-2xl">Employee Portal</CardTitle>
              <CardDescription>
                View assigned trips, update trip status, manage your profile, and submit trip logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" size="lg">
                Access Employee Portal
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Demo Credentials:</p>
          <p>Admin: admin@fleet.com / admin123</p>
          <p>Employee: employee@fleet.com / emp123</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
