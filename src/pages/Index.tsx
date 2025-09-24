import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_50%)] animate-pulse"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-bounce"></div>
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl animate-pulse"></div>
      
      <div className="text-center space-y-8 p-6 relative z-10">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Fleet Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive fleet management solution with separate portals for administrators and employees
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="cursor-pointer hover:shadow-primary/20 hover:border-primary/30 transition-all duration-500 group transform hover:scale-105 bg-gradient-to-br from-card via-card/90 to-muted/20" onClick={() => navigate("/admin/login")}>
            <CardHeader className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-muted/10 rounded-t-xl"></div>
              <Shield className="h-16 w-16 mx-auto text-foreground mb-6 group-hover:text-muted-foreground transition-colors duration-300 relative z-10" />
              <CardTitle className="text-3xl font-bold text-foreground relative z-10">Admin Portal</CardTitle>
              <CardDescription className="text-lg leading-relaxed relative z-10">
                Manage trips, vehicles, employees, and routes. Full administrative control over fleet operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <Button className="w-full text-lg py-6" size="lg" variant="default">
                Access Admin Portal
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-secondary/20 hover:border-secondary/30 transition-all duration-500 group transform hover:scale-105 bg-gradient-to-br from-card via-card/90 to-muted/20" onClick={() => navigate("/employee/login")}>
            <CardHeader className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-muted-foreground/5 to-muted/10 rounded-t-xl"></div>
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-6 group-hover:text-foreground transition-colors duration-300 relative z-10" />
              <CardTitle className="text-3xl font-bold text-muted-foreground relative z-10">Employee Portal</CardTitle>
              <CardDescription className="text-lg leading-relaxed relative z-10">
                View assigned trips, update trip status, manage your profile, and submit trip logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <Button variant="secondary" className="w-full text-lg py-6" size="lg">
                Access Employee Portal
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-sm text-muted-foreground bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-elegant">
          <p className="font-semibold text-foreground mb-2">Demo Credentials:</p>
          <div className="space-y-1">
            <p><span className="font-medium text-foreground">Admin:</span> admin@fleet.com / admin123</p>
            <p><span className="font-medium text-muted-foreground">Employee:</span> employee@fleet.com / emp123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
