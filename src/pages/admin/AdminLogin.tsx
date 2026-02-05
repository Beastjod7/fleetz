import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, getUserRole } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        const role = await getUserRole();
        if (role !== 'admin') {
          toast({
            title: "Access denied",
            description: "You don't have admin permissions.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Login successful",
          description: "Welcome back, Administrator!",
        });
        navigate("/admin/dashboard");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signUp(email, password, firstName, lastName, 'admin');
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-foreground">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-foreground" />

      <div className="w-full max-w-5xl mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="hidden lg:block text-primary-foreground space-y-8 animate-fade-in">
          <h1 className="text-5xl font-bold tracking-tight">
            Fleet Management
            <span className="block text-muted-foreground mt-2">Admin Portal</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Complete control over your fleet operations
          </p>
          <ul className="space-y-5 text-lg">
            {[
              "Manage and monitor all fleet vehicles in real-time",
              "Schedule trips and assign employees efficiently",
              "Track routes and optimize fleet performance",
              "Access comprehensive analytics and reports"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4 group" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-6 h-6 rounded-full bg-primary-foreground/10 flex items-center justify-center mt-0.5 group-hover:bg-primary-foreground/20 transition-colors">
                  <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-primary-foreground/80 group-hover:text-primary-foreground transition-colors">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Card className="w-full border-0 shadow-2xl bg-card animate-scale-in">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-foreground flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
            <CardDescription>
              Sign in to access the fleet management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="data-[state=active]:bg-foreground data-[state=active]:text-primary-foreground">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-foreground data-[state=active]:text-primary-foreground">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="animate-fade-in">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@fleet.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-muted/50 border-border focus:border-foreground focus:ring-foreground transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-muted/50 border-border focus:border-foreground focus:ring-foreground transition-all"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 text-primary-foreground transition-all hover:shadow-lg active:scale-[0.98]" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="animate-fade-in">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-12 bg-muted/50 border-border focus:border-foreground transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-12 bg-muted/50 border-border focus:border-foreground transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="admin@fleet.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-muted/50 border-border focus:border-foreground transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-muted/50 border-border focus:border-foreground transition-all"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 text-primary-foreground transition-all hover:shadow-lg active:scale-[0.98]" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Admin Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Employee?{" "}
                <span
                  className="text-foreground font-medium cursor-pointer hover:underline transition-all"
                  onClick={() => navigate("/employee/login")}
                >
                  Sign in here
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;