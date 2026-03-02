import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";

const EmployeeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        // Pass userId directly to avoid waiting for state update
        const role = await getUserRole(data.user.id);
        
        if (role === 'admin') {
          toast({ title: "Login successful", description: "Welcome back, Administrator!" });
          navigate("/admin/dashboard");
        } else if (role === 'employee') {
          toast({ title: "Login successful", description: "Welcome back!" });
          navigate("/employee/dashboard");
        } else {
          toast({
            title: "Access denied",
            description: "No role assigned to your account.",
            variant: "destructive",
          });
        }
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
    if (isLoading) return;
    setIsLoading(true);

    try {
      const { data, error } = await signUp(email, password, firstName, lastName, 'employee');
      
      if (error) {
        // Handle timeout errors gracefully - signup likely succeeded, try signing in
        if (error.message?.includes('timeout') || error.status === 504 || error.message === '{}' || !error.message) {
          // Try to sign in since the account was likely created
          const { data: signInData, error: signInError } = await signIn(email, password);
          if (signInData?.user && !signInError) {
            const role = await getUserRole(signInData.user.id);
            if (role === 'employee') {
              toast({ title: "Account created", description: "Welcome!" });
              navigate("/employee/dashboard");
              return;
            } else if (role === 'admin') {
              toast({ title: "Login successful", description: "Welcome back, Administrator!" });
              navigate("/admin/dashboard");
              return;
            }
          }
          toast({
            title: "Account may have been created",
            description: "Please try signing in with your credentials.",
          });
          return;
        }
        toast({
          title: "Signup failed",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
        return;
      }

      // If signup returned a session, the user is already logged in
      if (data?.session) {
        const role = await getUserRole(data.user?.id);
        if (role === 'employee') {
          toast({ title: "Account created", description: "Welcome!" });
          navigate("/employee/dashboard");
        } else if (role === 'admin') {
          toast({ title: "Account created", description: "Welcome!" });
          navigate("/admin/dashboard");
        } else {
          // Role might not be assigned yet due to trigger timing, try after a brief delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retryRole = await getUserRole(data.user?.id);
          if (retryRole === 'employee') {
            toast({ title: "Account created", description: "Welcome!" });
            navigate("/employee/dashboard");
          } else {
            toast({ title: "Account created", description: "Please sign in to continue." });
          }
        }
      } else {
        toast({
          title: "Account created",
          description: "Please sign in with your credentials.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Signup error",
        description: "An unexpected error occurred. Please try signing in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-muted">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1125850/pexels-photo-1125850.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted" />

      <div className="w-full max-w-5xl mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="hidden lg:block text-foreground space-y-8 animate-fade-in">
          <h1 className="text-5xl font-bold tracking-tight">
            Fleet Management
            <span className="block text-muted-foreground mt-2">Sign In Portal</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Your gateway to efficient trip management
          </p>
          <ul className="space-y-5 text-lg">
            {[
              "View all your assigned trips and schedules",
              "Update trip status with real-time tracking",
              "Access detailed route and vehicle information",
              "View your trip history and performance"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4 group" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center mt-0.5 group-hover:bg-foreground/20 transition-colors">
                  <svg className="w-4 h-4 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-foreground/70 group-hover:text-foreground transition-colors">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Card className="w-full border border-border shadow-2xl bg-card animate-scale-in">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center border border-border">
              <svg className="w-8 h-8 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">Fleet Management</CardTitle>
            <CardDescription>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
                <TabsTrigger value="login" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="animate-fade-in">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="employee@fleet.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-muted/50 border-border focus:border-foreground focus:ring-foreground transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 bg-muted/50 border-border focus:border-foreground focus:ring-foreground transition-all pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
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
                      placeholder="employee@fleet.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-muted/50 border-border focus:border-foreground transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="signupPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 bg-muted/50 border-border focus:border-foreground transition-all pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 text-primary-foreground transition-all hover:shadow-lg active:scale-[0.98]" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Employee Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeLogin;