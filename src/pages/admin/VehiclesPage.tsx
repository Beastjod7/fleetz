import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  status: string;
  capacity: number;
  mileage: number;
  fuel_type: string;
  last_maintenance_date: string | null;
  notes: string | null;
}

const VehiclesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vehicles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'in_use': return 'secondary';
      case 'maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b bg-gradient-card backdrop-blur-lg border-border/50">
        <div className="flex h-14 md:h-16 items-center px-3 md:px-6 gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")} className="shrink-0 h-8 px-2 md:px-3">
            <ArrowLeft className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Back to Dashboard</span>
          </Button>
          <h1 className="text-base md:text-xl font-semibold truncate">Vehicles</h1>
          <div className="ml-auto shrink-0">
            <Button size="sm" className="h-8 px-2 md:px-3" onClick={() => navigate("/admin/manage-vehicles")}>
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Add Vehicle</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  <Car className="h-6 w-6 mr-2" />
                  All Vehicles ({filteredVehicles.length})
                </CardTitle>
                <CardDescription className="text-lg">
                  Manage your fleet vehicles and their status
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading vehicles...</div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead>Last Maintenance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{vehicle.license_plate}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(vehicle.status)}>
                          {vehicle.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{vehicle.capacity} passengers</TableCell>
                      <TableCell>{vehicle.mileage?.toLocaleString() || 0} km</TableCell>
                      <TableCell className="capitalize">{vehicle.fuel_type}</TableCell>
                      <TableCell>
                        {vehicle.last_maintenance_date ? 
                          new Date(vehicle.last_maintenance_date).toLocaleDateString() : 
                          'No record'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
            {!loading && filteredVehicles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No vehicles found matching your search.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehiclesPage;