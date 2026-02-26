import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, Users } from "lucide-react";
import fleetBg from "@/assets/fleet-bg.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${fleetBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-gray-900/80 backdrop-blur-[2px]"></div>
      </div>
      
      {/* Animated accents */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gray-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      
      <div className="text-center space-y-8 md:space-y-12 p-4 md:p-6 relative z-10 max-w-6xl mx-auto">
        <div className="space-y-4 md:space-y-6">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-2xl">
              Fleet Management
            </span>
            <br />
            <span className="bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 bg-clip-text text-transparent">
              System
            </span>
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-8 md:mt-16">
          <Card 
            className="cursor-pointer hover:shadow-2xl hover:shadow-white/20 transition-all duration-500 group hover:scale-105 bg-gradient-to-br from-gray-900/90 via-black/80 to-gray-800/90 border-gray-700/50 backdrop-blur-md" 
            onClick={() => navigate("/admin/login")}
          >
            <CardHeader className="text-center space-y-4 md:space-y-6 pt-6 md:pt-10">
              <div className="mx-auto w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-white/20 to-gray-400/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-7 w-7 md:h-10 md:w-10 text-white drop-shadow-lg" />
              </div>
              <CardTitle className="text-2xl md:text-4xl font-black text-white tracking-tight">
                Admin Portal
              </CardTitle>
              <CardDescription className="text-gray-300 text-base leading-relaxed px-4">
                Manage trips, vehicles, employees, and routes. Full administrative control over fleet operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6 md:pb-10">
              <Button 
                className="w-full text-base md:text-lg py-5 md:py-7 bg-white text-black hover:bg-gray-200 font-bold tracking-wide shadow-lg hover:shadow-xl transition-all duration-300" 
                size="lg"
              >
                Access Admin Portal
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-2xl hover:shadow-gray-400/20 transition-all duration-500 group hover:scale-105 bg-gradient-to-br from-gray-800/90 via-gray-700/80 to-gray-900/90 border-gray-600/50 backdrop-blur-md" 
            onClick={() => navigate("/employee/login")}
          >
            <CardHeader className="text-center space-y-4 md:space-y-6 pt-6 md:pt-10">
              <div className="mx-auto w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-400/30 to-gray-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7 md:h-10 md:w-10 text-gray-300 drop-shadow-lg" />
              </div>
              <CardTitle className="text-2xl md:text-4xl font-black text-gray-200 tracking-tight">
                Employee Portal
              </CardTitle>
              <CardDescription className="text-gray-400 text-base leading-relaxed px-4">
                View assigned trips, update trip status, manage your profile, and submit trip logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6 md:pb-10">
              <Button 
                className="w-full text-base md:text-lg py-5 md:py-7 bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-500 hover:to-gray-600 font-bold tracking-wide shadow-lg hover:shadow-xl transition-all duration-300" 
                size="lg"
              >
                Access Employee Portal
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Index;
