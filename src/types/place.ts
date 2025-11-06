export interface Place {
  id: string;
  name: string;
  vicinity: string;
  distance: string;
  duration: string;
  geometry: { location: { lat: number; lng: number; }; };
}
