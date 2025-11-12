// RouteMap.tsx
import { useEffect, useState } from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { type MarkerData } from '../types/Marker';

type RouteData = {
    distance: number;
    duration: number;
    coordinates: [number, number][];
};

type Props = {
    selectedPoints: MarkerData[];
};

const greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const RouteMap = ({ selectedPoints }: Props) => {
    const [route, setRoute] = useState<RouteData | null>(null);

    useEffect(() => {
        const fetchRoute = async () => {
            if (selectedPoints.length !== 2) {
                setRoute(null);
                return;
            }

            const [start, end] = selectedPoints;
            console.log('Fetching route for points:', start, end);

            // ✅ URL flexible pour dev et prod
            const url = `https://light-nav-backend.vercel.app/route?start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;

            try {
                const response = await fetch(url);

                // Vérification du type de contenu pour éviter HTML inattendu
                const contentType = response.headers.get('content-type') || '';
                if (!contentType.includes('application/json')) {
                    console.error('Fetch route failed: response is not JSON', await response.text());
                    setRoute(null);
                    return;
                }

                const data: any = await response.json();

                if (data.error) {
                    console.error('ORS API error:', data.error);
                    alert(`ORS API error: ${data.error}`);
                    setRoute(null);
                    return;
                }

                if (!data.features || data.features.length === 0) {
                    console.warn('Aucune route trouvée pour ces points.');
                    alert("Aucune route trouvée pour ces points");
                    setRoute(null);
                    return;
                }

                const coords: [number, number][] = data.features[0].geometry.coordinates.map(
                    (c: [number, number]) => [c[1], c[0]] // Leaflet = lat,lng
                );
                const summary = data.features[0].properties.summary;

                setRoute({
                    distance: summary.distance,
                    duration: summary.duration,
                    coordinates: coords,
                });
            } catch (err: unknown) {
                if (err instanceof Error) {
                    console.error('Fetch route failed:', err.message);
                } else {
                    console.error('Fetch route failed:', err);
                }
                setRoute(null);
            }
        };

        fetchRoute();
    }, [selectedPoints]);

    if (!route) return null;

    return (
        <>
            <Polyline positions={route.coordinates} color="blue" />
            <Marker position={[selectedPoints[0].lat, selectedPoints[0].lng]} icon={greenIcon}>
                <Popup>Start: {selectedPoints[0].title}</Popup>
            </Marker>
            <Marker position={[selectedPoints[1].lat, selectedPoints[1].lng]} icon={redIcon}>
                <Popup>End: {selectedPoints[1].title}</Popup>
            </Marker>

            <div
                style={{
                    position: 'fixed',
                    bottom: 15,
                    left: 15,
                    zIndex: 1000,
                    background: 'rgba(255,255,255,0.95)',
                    padding: '10px 14px',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    fontSize: 14,
                }}
            >
                Distance: {(route.distance / 1000).toFixed(2)} km <br />
                Durée: {(route.duration / 60).toFixed(0)} min
            </div>
        </>
    );
};

export default RouteMap;
