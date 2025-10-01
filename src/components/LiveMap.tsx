import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LiveMapProps {
  isAdmin?: boolean;
  employeeId?: string;
}

interface TripLocation {
  trip_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
  trip?: {
    id: string;
    vehicle?: {
      make: string;
      model: string;
      license_plate: string;
    };
    assigned_employee?: {
      first_name: string;
      last_name: string;
    };
    status: string;
  };
}

const LiveMap: React.FC<LiveMapProps> = ({ isAdmin = false, employeeId }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const { toast } = useToast();
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState<TripLocation[]>([]);
  const [trackingInterval, setTrackingInterval] = useState<number | null>(null);

  useEffect(() => {
    initializeMap();
    
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (isMapReady) {
      fetchLocations();
      subscribeToLocationUpdates();
    }
  }, [isMapReady]);

  const initializeMap = async () => {
    if (!mapContainer.current) return;

    try {
      // Fetch Mapbox token from edge function
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (error) throw error;
      if (!data?.token) {
        throw new Error('No Mapbox token received. Please configure MAPBOX_PUBLIC_TOKEN in Supabase secrets.');
      }

      mapboxgl.accessToken = data.token;
      
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        zoom: 12,
        center: [-73.9851, 40.7589], // Default center (NYC)
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      map.current.on('load', () => {
        setIsMapReady(true);
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: error instanceof Error ? error.message : "Failed to initialize map",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('trip_locations')
        .select(`
          *,
          trip:trips!trip_locations_trip_id_fkey (
            id,
            status,
            vehicle:vehicles(make, model, license_plate),
            assigned_employee:profiles!trips_assigned_employee_id_fkey(first_name, last_name)
          )
        `)
        .order('recorded_at', { ascending: false });

      // Get latest location for each active trip
      const { data: latestLocations, error } = await query;

      if (error) throw error;

      // Filter to get only the most recent location per trip
      const locationMap = new Map();
      latestLocations?.forEach((loc: any) => {
        if (loc.trip?.status === 'in_progress' && !locationMap.has(loc.trip_id)) {
          locationMap.set(loc.trip_id, loc);
        }
      });

      const uniqueLocations = Array.from(locationMap.values());
      setLocations(uniqueLocations);
      updateMarkers(uniqueLocations);

      // Auto-fit map to show all locations
      if (uniqueLocations.length > 0 && map.current) {
        const bounds = new mapboxgl.LngLatBounds();
        uniqueLocations.forEach((loc: any) => {
          bounds.extend([parseFloat(loc.longitude), parseFloat(loc.latitude)]);
        });
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      }

    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vehicle locations",
        variant: "destructive",
      });
    }
  };

  const updateMarkers = (locations: TripLocation[]) => {
    if (!map.current) return;

    // Remove old markers
    markers.current.forEach((marker) => marker.remove());
    markers.current.clear();

    // Add new markers
    locations.forEach((location: any) => {
      const markerElement = document.createElement('div');
      markerElement.className = 'w-4 h-4 rounded-full border-2 border-white shadow-lg bg-primary animate-pulse';

      const vehicleName = location.trip?.vehicle 
        ? `${location.trip.vehicle.make} ${location.trip.vehicle.model}`
        : 'Unknown Vehicle';

      const employeeName = location.trip?.assigned_employee
        ? `${location.trip.assigned_employee.first_name || ''} ${location.trip.assigned_employee.last_name || ''}`.trim()
        : 'Unassigned';

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([parseFloat(location.longitude), parseFloat(location.latitude)])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${vehicleName}</h3>
              <p class="text-sm text-muted-foreground">Driver: ${employeeName}</p>
              <p class="text-xs text-muted-foreground">
                ${new Date(location.recorded_at).toLocaleTimeString()}
              </p>
            </div>
          `)
        )
        .addTo(map.current!);

      markers.current.set(location.trip_id, marker);
    });
  };

  const subscribeToLocationUpdates = () => {
    const channel = supabase
      .channel('location-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trip_locations'
        },
        () => {
          fetchLocations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ];
          
          if (map.current) {
            map.current.flyTo({
              center: coords,
              zoom: 15,
              duration: 2000
            });

            // Add current location marker
            new mapboxgl.Marker({
              color: '#ef4444'
            })
              .setLngLat(coords)
              .setPopup(new mapboxgl.Popup().setHTML('<p class="font-medium">Your Location</p>'))
              .addTo(map.current);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Failed to get your current location",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
    }
  };

  const startLocationTracking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has an active trip
      const { data: activeTrips } = await supabase
        .from('trips')
        .select('id')
        .eq('assigned_employee_id', user.id)
        .eq('status', 'in_progress')
        .limit(1);

      if (!activeTrips || activeTrips.length === 0) {
        toast({
          title: "No Active Trip",
          description: "You don't have an active trip to track",
          variant: "destructive",
        });
        return;
      }

      const tripId = activeTrips[0].id;

      // Start tracking location every 30 seconds
      const interval = window.setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { error } = await supabase
                  .from('trip_locations')
                  .insert({
                    trip_id: tripId,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    speed: position.coords.speed,
                    heading: position.coords.heading,
                    accuracy: position.coords.accuracy,
                    recorded_at: new Date().toISOString()
                  });

                if (error) throw error;
                console.log('Location updated successfully');
              } catch (error) {
                console.error('Error updating location:', error);
              }
            },
            (error) => {
              console.error('Geolocation error:', error);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0
            }
          );
        }
      }, 30000); // Update every 30 seconds

      setTrackingInterval(interval);
      
      toast({
        title: "Tracking Started",
        description: "Your location is now being tracked",
      });
    } catch (error) {
      console.error('Error starting location tracking:', error);
      toast({
        title: "Error",
        description: "Failed to start location tracking",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Auto-start tracking for employees with active trips
    if (!isAdmin && isMapReady) {
      startLocationTracking();
    }
  }, [isMapReady, isAdmin]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing map...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Live Vehicle Tracking</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          className="flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          My Location
        </Button>
      </div>
      
      <Card className="relative overflow-hidden">
        <div ref={mapContainer} className="w-full h-96" />
        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
      </Card>

      {isAdmin && locations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {locations.map((location: any) => (
            <Card key={location.trip_id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    {location.trip?.vehicle 
                      ? `${location.trip.vehicle.make} ${location.trip.vehicle.model}`
                      : 'Unknown Vehicle'
                    }
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {parseFloat(location.latitude).toFixed(4)}, {parseFloat(location.longitude).toFixed(4)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(location.recorded_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveMap;