import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Car, Edit, Trash2, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  capacity: number;
  mileage: number;
  fuel_type: string;
  last_maintenance_date: string | null;
  notes: string | null;
  created_at: string;
}

const ManageVehiclesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    license_plate: "",
    capacity: "",
    mileage: "",
    fuel_type: "gasoline",
    last_maintenance_date: "",
    notes: ""
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const vehicleData = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        license_plate: formData.license_plate,
        capacity: parseInt(formData.capacity),
        mileage: parseInt(formData.mileage || "0"),
        fuel_type: formData.fuel_type,
        last_maintenance_date: formData.last_maintenance_date || null,
        notes: formData.notes || null,
        status: editingVehicle ? editingVehicle.status : 'available' as const
      };

      let error;
      if (editingVehicle) {
        ({ error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', editingVehicle.id));
      } else {
        ({ error } = await supabase
          .from('vehicles')
          .insert(vehicleData));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Vehicle ${editingVehicle ? 'updated' : 'created'} successfully`,
      });

      setShowCreateDialog(false);
      setEditingVehicle(null);
      resetForm();
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to save vehicle",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      license_plate: vehicle.license_plate,
      capacity: vehicle.capacity.toString(),
      mileage: vehicle.mileage.toString(),
      fuel_type: vehicle.fuel_type,
      last_maintenance_date: vehicle.last_maintenance_date || "",
      notes: vehicle.notes || ""
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });

      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
    }
  };

  const updateVehicleStatus = async (vehicleId: string, newStatus: 'available' | 'in_use' | 'maintenance' | 'out_of_service') => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ status: newStatus })
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle status updated successfully",
      });

      fetchVehicles();
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      make: "",
      model: "",
      year: "",
      license_plate: "",
      capacity: "",
      mileage: "",
      fuel_type: "gasoline",
      last_maintenance_date: "",
      notes: ""
    });
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
        <div className="flex h-16 items-center px-4 md:px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-semibold">Vehicle Management</h1>
          <div className="ml-auto flex items-center space-x-4">
            <Dialog open={showCreateDialog} onOpenChange={(open) => {
              setShowCreateDialog(open);
              if (!open) {
                setEditingVehicle(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                  <DialogDescription>
                    {editingVehicle ? 'Update the vehicle information below.' : 'Add a new vehicle to your fleet.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make *</Label>
                      <Input
                        id="make"
                        value={formData.make}
                        onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                        placeholder="Toyota"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="Camry"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        min="1900"
                        max="2030"
                        value={formData.year}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                        placeholder="2023"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license_plate">License Plate *</Label>
                      <Input
                        id="license_plate"
                        value={formData.license_plate}
                        onChange={(e) => setFormData(prev => ({ ...prev, license_plate: e.target.value.toUpperCase() }))}
                        placeholder="ABC-123"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity *</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        value={formData.capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                        placeholder="5"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fuel_type">Fuel Type</Label>
                      <Select value={formData.fuel_type} onValueChange={(value) => setFormData(prev => ({ ...prev, fuel_type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gasoline">Gasoline</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mileage">Current Mileage (km)</Label>
                      <Input
                        id="mileage"
                        type="number"
                        min="0"
                        value={formData.mileage}
                        onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                        placeholder="50000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_maintenance_date">Last Maintenance Date</Label>
                    <Input
                      id="last_maintenance_date"
                      type="date"
                      value={formData.last_maintenance_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_maintenance_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about the vehicle..."
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
                  Vehicle Fleet Management ({filteredVehicles.length})
                </CardTitle>
                <CardDescription className="text-lg">
                  Add, edit, and manage all vehicles in your fleet
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading vehicles...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.year} • {vehicle.fuel_type}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{vehicle.license_plate}</TableCell>
                      <TableCell>
                        <Select value={vehicle.status} onValueChange={(value) => updateVehicleStatus(vehicle.id, value as 'available' | 'in_use' | 'maintenance' | 'out_of_service')}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="in_use">In Use</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{vehicle.capacity} passengers</TableCell>
                      <TableCell>{vehicle.mileage?.toLocaleString() || 0} km</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(vehicle)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

export default ManageVehiclesPage;