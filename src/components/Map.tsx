import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { icons } from '../utils/icons';
import { type MarkerData } from '../types/Marker';
import RouteMap from './RouteMap';

const DEFAULT_POSITION: [number, number] = [40.4168, -3.7038];
const CATEGORIES: MarkerData['category'][] = ['Restaurant', 'Parc', 'Museum', 'Subway', 'Airport'];

// Correction des icônes Leaflet par défaut
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Map = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [filter, setFilter] = useState<MarkerData['category'] | 'All'>('All');
  const [selectedPoints, setSelectedPoints] = useState<MarkerData[]>([]);

  useEffect(() => {
    const fetchMarkers = async () => {
      const querySnapshot = await getDocs(collection(db, 'markers'));
      const data: MarkerData[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarkerData));
      setMarkers(data);
    };
    fetchMarkers();
  }, []);

  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        const title = prompt('Marker title') || 'Without title';
        const categoryInput = prompt(`Category (${CATEGORIES.join(' / ')})`);
        const category = categoryInput as MarkerData['category'];
        if (!category || !CATEGORIES.includes(category)) {
          alert('Invalid category!');
          return;
        }
        const newMarker: MarkerData = { id: '', lat: e.latlng.lat, lng: e.latlng.lng, title, category };
        const docRef = await addDoc(collection(db, 'markers'), newMarker);
        newMarker.id = docRef.id;
        setMarkers(prev => [...prev, newMarker]);
      },
    });
    return null;
  };

  const displayedMarkers = filter === 'All' ? markers : markers.filter(m => m.category === filter);

  const toggleSelectPoint = (marker: MarkerData) => {
    if (selectedPoints.some(p => p.id === marker.id)) {
      setSelectedPoints(selectedPoints.filter(p => p.id !== marker.id));
    } else if (selectedPoints.length < 2) {
      setSelectedPoints([...selectedPoints, marker]);
    } else {
      setSelectedPoints([marker]);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative', fontFamily: 'Roboto, sans-serif' }}>
      <div
        style={{
          position: 'absolute',
          top: 15,
          left: 15,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.95)',
          padding: '12px 16px',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          minWidth: 160,
        }}
      >
        <label>Filter:</label>
        <select value={filter} onChange={e => setFilter(e.target.value as MarkerData['category'] | 'All')}>
          <option value="All">All</option>
          {CATEGORIES.map(c => (<option key={c} value={c}>{c}</option>))}
        </select>
      </div>

      <MapContainer center={DEFAULT_POSITION} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />

        {displayedMarkers.map((marker, index) => (
          <Marker
            key={marker.id || `temp-${index}`}
            position={[marker.lat, marker.lng]}
            icon={icons[marker.category] || icons.Museum}
            eventHandlers={{ click: () => toggleSelectPoint(marker) }}
          >
            <Popup>
              <div>
                <strong>{marker.title}</strong>
                <br />
                <em>{selectedPoints.some(p => p.id === marker.id) ? 'Selected' : 'Click to select'}</em>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Composant enfant pour calculer et afficher la route */}
        <RouteMap selectedPoints={selectedPoints} />
      </MapContainer>
    </div>
  );
};

export default Map;
