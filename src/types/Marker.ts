// ../types/Marker.ts
export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: 'Restaurant' | 'Parc' | 'Museum' | 'Subway' | 'Airport';
}

export async function loadMarkers(url: string): Promise<MarkerData[]> {
  console.log('Fetching markers from:', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  console.log('✅ JSON loaded:', data);
  return data;
}
