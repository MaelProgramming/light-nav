import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import type { MarkerData } from '../types/Marker';

// Correction des icônes Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Deleting default comments
delete (L.Icon.Default.prototype as any)._getIconUrl;
// Adding new icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// Creating default position
const DEFAULT_POSITION: [number, number] = [40.4168, -3.7038]; // Madrid
const CATEGORIES: MarkerData['category'][] = ['Restaurant', 'Parc', 'Museum', 'Subway', 'Airport'];

const MapComponent = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [filter, setFilter] = useState<MarkerData['category'] | 'All'>('All');

  // Charger les marqueurs depuis le JSON local
  useEffect(() => {
    const url = import.meta.env.BASE_URL + 'data/markers.json';
    console.log('Fetching markers from:', url);

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: MarkerData[]) => {
        console.log('✅ JSON loaded:', data);
        setMarkers(data);
      })
      .catch(err => console.error('❌ Failed to load markers JSON:', err));
  }, []);

  // Sauvegarder automatiquement les ajouts dans localStorage
  useEffect(() => {
    localStorage.setItem('markers', JSON.stringify(markers));
  }, [markers]);

  // Ajouter un marqueur au clic
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const title = prompt('Marker title') || 'Without title';
        const categoryInput = prompt(`Category (${CATEGORIES.join(' / ')})`);
        const category = categoryInput as MarkerData['category'];

        if (!category || !CATEGORIES.includes(category)) {
          alert('Invalid category!');
          return;
        }

        setMarkers(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            title,
            category
          }
        ]);
      }
    });
    return null;
  };

  // Supprimer le dernier marqueur
  const deleteLastMarker = () => {
    if (markers.length === 0) return alert('No markers to delete!');
    setMarkers(prev => prev.slice(0, prev.length - 1));
  };

  // Exporter les marqueurs en JSON
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(markers, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markers.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtrer les marqueurs selon la catégorie
  const displayedMarkers = filter === 'All' ? markers : markers.filter(m => m.category === filter);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Boutons Delete, Export et filtre */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'white', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <button onClick={deleteLastMarker} style={{ cursor: 'pointer' }}>Delete Last Marker</button>
        <button onClick={downloadJSON} style={{ cursor: 'pointer' }}>💾 Export JSON</button>
        <label>
          Filter: 
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as MarkerData['category'] | 'All')}
            style={{ marginLeft: 5 }}
          >
            <option value="All">All</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </label>
      </div>
      {/* Initializing the map container*/ }
      <MapContainer center={DEFAULT_POSITION} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        {displayedMarkers.map(marker => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            <Popup>
              <strong>{marker.title}</strong> <br />
              Category: {marker.category}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
// Exporting the component to be imported by the main component of the app
export default MapComponent;
