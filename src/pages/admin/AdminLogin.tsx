import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication - replace with actual auth later
    if (email === "admin@fleet.com" && password === "admin123") {
      toast({
        title: "Login successful",
        description: "Welcome back, Administrator!",
      });
      navigate("/admin/dashboard");
    } else {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]"></div>
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-md relative z-10 border-primary/20 shadow-primary/10">
        <CardHeader className="text-center relative">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-t-xl"></div>
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent relative z-10">Admin Portal</CardTitle>
          <CardDescription className="text-lg relative z-10">
            Sign in to access the fleet management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@fleet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full text-lg py-6" size="lg">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Employee? <span 
                className="text-primary cursor-pointer hover:underline"
                onClick={() => navigate("/employee/login")}
              >
                Sign in here
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;