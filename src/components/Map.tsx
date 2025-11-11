import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { icons } from "../utils/icons";
import { type MarkerData } from '../types/Marker';

const DEFAULT_POSITION: [number, number] = [40.4168, -3.7038]; // Madrid
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

const MapComponent = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [filter, setFilter] = useState<MarkerData['category'] | 'All'>('All');

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
      }
    });
    return null;
  };

  const displayedMarkers = filter === 'All' ? markers : markers.filter(m => m.category === filter);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative', fontFamily: 'Roboto, sans-serif' }}>

      {/* Barre flottante en haut à gauche */}
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
          minWidth: 160
        }}
      >
        <a href="/privacy-policy" style={{ fontSize: 12, color: '#555' }}>
          Privacy Policy
        </a>
        <label style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>
          Filter:
        </label>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as MarkerData['category'] | 'All')}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          <option value="All">All</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Carte */}
      <MapContainer
        center={DEFAULT_POSITION}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        {displayedMarkers.map(marker => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={icons[marker.category] || icons.Museum}
          >
            <Popup
              closeButton={true}
              closeOnClick={false}
              autoPan={true}
              minWidth={180}
            >
              <div style={{ fontSize: 14 }}>
                <strong>{marker.title}</strong>
                <br />
                <span style={{ color: '#555' }}>Category: {marker.category}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
