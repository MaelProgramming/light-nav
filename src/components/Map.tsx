// Map.tsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { collection, addDoc, onSnapshot } from 'firebase/firestore'; // onSnapshot importé
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

// Correction: Ne stocke plus le champ 'id' dans Firestore
const MapClickHandler = ({ onAddMarker }: { onAddMarker: (marker: MarkerData) => void }) => {
  useMapEvents({
    click: async (e) => {
      const title = prompt('Marker title') || 'Without title';
      const categoryInput = prompt(`Category (${CATEGORIES.join(' / ')})`);
      const category = categoryInput as MarkerData['category'];
      if (!category || !CATEGORIES.includes(category)) {
        alert('Invalid category!');
        return;
      }

      // Crée un objet SANS l'ID pour le stockage Firestore
      const markerPayload = { 
        lat: e.latlng.lat, 
        lng: e.latlng.lng, 
        title, 
        category 
      };
      
      // Stocke le document. onSnapshot mettra à jour l'état local.
      await addDoc(collection(db, 'markers'), markerPayload); 
    },
  });
  return null;
};

const Map = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [filter, setFilter] = useState<MarkerData['category'] | 'All'>('All');
  const [selectedPoints, setSelectedPoints] = useState<MarkerData[]>([]);

  // 🔄 Correction: Utilisation de onSnapshot pour la synchronisation en temps réel
  useEffect(() => {
    const markersCollection = collection(db, 'markers');
    
    // Configuration de l'écouteur en temps réel
    const unsubscribe = onSnapshot(markersCollection, (querySnapshot) => {
      const data: MarkerData[] = querySnapshot.docs.map(doc => {
        const docData = doc.data(); 

        // Remplacement essentiel: doc.id est la source de vérité pour l'ID
        return { 
          id: doc.id,
          lat: docData.lat as number,
          lng: docData.lng as number,
          title: docData.title as string,
          category: docData.category as MarkerData['category']
        } as MarkerData;
      });
      
      console.log(`[Firestore] ${data.length} marqueurs chargés.`); // Log de vérification
      setMarkers(data);
    }, 
    (error) => {
      console.error("[Firestore ERREUR] La récupération a échoué:", error);
    });

    // Nettoyage: Désabonnement lors du démontage du composant
    return () => unsubscribe();
  }, []); // [] garantit que l'écouteur est configuré une seule fois

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
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Filter UI */}
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

        <MapClickHandler onAddMarker={() => {}} /> 

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
                {/* Ajout d'une vérification pour l'état de sélection */}
                <em>{selectedPoints.some(p => p.id === marker.id) ? 'Selected' : 'Click to select'}</em>
              </div>
            </Popup>
          </Marker>
        ))}

        <RouteMap selectedPoints={selectedPoints} />
      </MapContainer>
    </div>
  );
};

export default Map;