export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: 'Restaurant' | 'Parc' | 'Museum' | 'Subway' | 'Airport';
}
