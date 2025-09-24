import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VehiclesPage from "./pages/admin/VehiclesPage";
import EmployeesPage from "./pages/admin/EmployeesPage";
import TripsPage from "./pages/admin/TripsPage";
import CreateTripPage from "./pages/admin/CreateTripPage";
import ManageVehiclesPage from "./pages/admin/ManageVehiclesPage";
import ManageRoutesPage from "./pages/admin/ManageRoutesPage";
import EmployeeLogin from "./pages/employee/EmployeeLogin";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/vehicles" element={<VehiclesPage />} />
          <Route path="/admin/employees" element={<EmployeesPage />} />
          <Route path="/admin/trips" element={<TripsPage />} />
          <Route path="/admin/create-trip" element={<CreateTripPage />} />
          <Route path="/admin/manage-vehicles" element={<ManageVehiclesPage />} />
          <Route path="/admin/manage-routes" element={<ManageRoutesPage />} />
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
