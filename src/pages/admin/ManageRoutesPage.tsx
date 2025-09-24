import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Route, Edit, Trash2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Route {
  id: string;
  name: string;
  start_location: string;
  end_location: string;
  distance_km: number | null;
  estimated_duration_minutes: number | null;
  is_active: boolean;
  waypoints: any;
  created_at: string;
}

const ManageRoutesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    start_location: "",
    end_location: "",
    distance_km: "",
    estimated_duration_minutes: "",
    waypoints: "[]"
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch routes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const routeData = {
        name: formData.name,
        start_location: formData.start_location,
        end_location: formData.end_location,
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
        estimated_duration_minutes: formData.estimated_duration_minutes ? parseInt(formData.estimated_duration_minutes) : null,
        waypoints: JSON.parse(formData.waypoints || "[]"),
        is_active: true
      };

      let error;
      if (editingRoute) {
        ({ error } = await supabase
          .from('routes')
          .update(routeData)
          .eq('id', editingRoute.id));
      } else {
        ({ error } = await supabase
          .from('routes')
          .insert(routeData));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Route ${editingRoute ? 'updated' : 'created'} successfully`,
      });

      setShowCreateDialog(false);
      setEditingRoute(null);
      resetForm();
      fetchRoutes();
    } catch (error) {
      console.error('Error saving route:', error);
      toast({
        title: "Error",
        description: "Failed to save route",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      start_location: route.start_location,
      end_location: route.end_location,
      distance_km: route.distance_km?.toString() || "",
      estimated_duration_minutes: route.estimated_duration_minutes?.toString() || "",
      waypoints: JSON.stringify(route.waypoints || [])
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (routeId: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;

    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Route deleted successfully",
      });

      fetchRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
      toast({
        title: "Error",
        description: "Failed to delete route",
        variant: "destructive",
      });
    }
  };

  const toggleRouteStatus = async (routeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('routes')
        .update({ is_active: !currentStatus })
        .eq('id', routeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Route ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchRoutes();
    } catch (error) {
      console.error('Error updating route status:', error);
      toast({
        title: "Error",
        description: "Failed to update route status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      start_location: "",
      end_location: "",
      distance_km: "",
      estimated_duration_minutes: "",
      waypoints: "[]"
    });
  };

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.start_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.end_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b bg-gradient-card backdrop-blur-lg border-border/50">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-semibold">Route Management</h1>
          <div className="ml-auto flex items-center space-x-4">
            <Dialog open={showCreateDialog} onOpenChange={(open) => {
              setShowCreateDialog(open);
              if (!open) {
                setEditingRoute(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Route
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingRoute ? 'Edit Route' : 'Create New Route'}</DialogTitle>
                  <DialogDescription>
                    {editingRoute ? 'Update the route information below.' : 'Add a new route to your fleet management system.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Route Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Downtown Express"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distance">Distance (km)</Label>
                      <Input
                        id="distance"
                        type="number"
                        step="0.1"
                        value={formData.distance_km}
                        onChange={(e) => setFormData(prev => ({ ...prev, distance_km: e.target.value }))}
                        placeholder="25.5"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start">Start Location *</Label>
                      <Input
                        id="start"
                        value={formData.start_location}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_location: e.target.value }))}
                        placeholder="Central Station"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end">End Location *</Label>
                      <Input
                        id="end"
                        value={formData.end_location}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_location: e.target.value }))}
                        placeholder="Airport Terminal"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.estimated_duration_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration_minutes: e.target.value }))}
                      placeholder="45"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingRoute ? 'Update Route' : 'Create Route'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        <Card className="border-success/20">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  <Route className="h-6 w-6 mr-2" />
                  Route Management ({filteredRoutes.length})
                </CardTitle>
                <CardDescription className="text-lg">
                  Create, edit, and manage all routes in your fleet system
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading routes...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route Name</TableHead>
                    <TableHead>Start → End</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoutes.map((route) => (
                    <TableRow key={route.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{route.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{route.start_location}</span>
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{route.end_location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {route.distance_km ? `${route.distance_km} km` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {route.estimated_duration_minutes ? `${route.estimated_duration_minutes} min` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={route.is_active ? "default" : "secondary"}
                          size="sm"
                          onClick={() => toggleRouteStatus(route.id, route.is_active)}
                        >
                          {route.is_active ? 'Active' : 'Inactive'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(route)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(route.id)}
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
            {!loading && filteredRoutes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No routes found matching your search.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageRoutesPage;