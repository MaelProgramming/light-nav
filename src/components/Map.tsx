import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import type{ MarkerData } from '../types/Marker';

const DEFAULT_POSITION: [number, number] = [40.4168, -3.7038]; // Madrid

const MapComponent = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('markers');
    if (saved) setMarkers(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('markers', JSON.stringify(markers));
  }, [markers]);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setMarkers([...markers, {
          id: crypto.randomUUID(),
          lat: e.latlng.lat,
          lng: e.latlng.lng
        }]);
      }
    });
    return null;
  };

  return (
    <MapContainer center={DEFAULT_POSITION} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler />
      {markers.map(marker => (
        <Marker key={marker.id} position={[marker.lat, marker.lng]} />
      ))}
    </MapContainer>
  );
};

export default MapComponent;
