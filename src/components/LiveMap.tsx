import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface LiveMapProps {
  isAdmin?: boolean;
  employeeId?: string;
}

const LiveMap: React.FC<LiveMapProps> = ({ isAdmin = false, employeeId }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [vehicles, setVehicles] = useState([
    { id: 1, name: 'Vehicle 001', lat: 40.7589, lng: -73.9851, status: 'active' },
    { id: 2, name: 'Vehicle 002', lat: 40.7505, lng: -73.9934, status: 'active' },
    { id: 3, name: 'Vehicle 003', lat: 40.7614, lng: -73.9776, status: 'inactive' }
  ]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      zoom: 12,
      center: [-73.9851, 40.7589], // New York City
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
      addVehicleMarkers();
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  const addVehicleMarkers = () => {
    if (!map.current) return;

    vehicles.forEach((vehicle) => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = `w-4 h-4 rounded-full border-2 border-white shadow-lg ${
        vehicle.status === 'active' ? 'bg-primary animate-pulse' : 'bg-muted'
      }`;

      // Add marker to map
      new mapboxgl.Marker(markerElement)
        .setLngLat([vehicle.lng, vehicle.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${vehicle.name}</h3>
            <p class="text-sm text-muted-foreground">Status: ${vehicle.status}</p>
          </div>
        `))
        .addTo(map.current!);
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ];
          setCurrentLocation(coords);
          
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
              .setPopup(new mapboxgl.Popup().setHTML('<p>Your Current Location</p>'))
              .addTo(map.current);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      // Token will be used in useEffect
    }
  };

  if (!mapboxToken) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Live Vehicle Tracking</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            To enable live tracking, please enter your Mapbox public token.
            Get your token from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
          </p>
          <form onSubmit={handleTokenSubmit} className="space-y-3">
            <Input
              type="text"
              placeholder="Enter your Mapbox public token..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Initialize Map
            </Button>
          </form>
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

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{vehicle.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  vehicle.status === 'active' ? 'bg-primary animate-pulse' : 'bg-muted'
                }`} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveMap;