// app/services/mapsService.ts - Maps service supporting both Yandex and Google Maps
import env from '../config/env';

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface MapRegion extends MapCoordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MarkerData {
  id: string;
  coordinate: MapCoordinate;
  title: string;
  description: string;
  onPress?: () => void;
}

export type MapProvider = 'yandex' | 'google';

class MapsService {
  private provider: MapProvider;
  private yandexApiKey: string;
  private googleApiKey: string;

  constructor() {
    this.yandexApiKey = env.YANDEX_MAPS_API_KEY || '';
    this.googleApiKey = env.GOOGLE_MAPS_API_KEY || '';
    
    // Prefer provider with valid API key
    if (this.isValidApiKey(this.yandexApiKey)) {
      this.provider = 'yandex';
    } else if (this.isValidApiKey(this.googleApiKey)) {
      this.provider = 'google';
    } else {
      this.provider = (env.MAPS_PROVIDER as MapProvider) || 'yandex';
    }

    console.log('🗺️ Maps Service initialized:', {
      provider: this.provider,
      yandexKey: this.yandexApiKey ? `${this.yandexApiKey.substring(0, 10)}...` : 'none',
      googleKey: this.googleApiKey ? `${this.googleApiKey.substring(0, 10)}...` : 'none',
    });
  }

  // Get current maps provider
  getProvider(): MapProvider {
    return this.provider;
  }

  // Switch maps provider
  setProvider(provider: MapProvider): void {
    this.provider = provider;
  }

  // Get API key for current provider
  getApiKey(): string {
    return this.provider === 'yandex' ? this.yandexApiKey : this.googleApiKey;
  }

  // Check if a specific API key is valid
  private isValidApiKey(apiKey: string): boolean {
    return Boolean(apiKey && apiKey !== '' && !apiKey.includes('your_') && !apiKey.includes('_here'));
  }

  // Check if current provider has valid API key
  hasValidApiKey(): boolean {
    const apiKey = this.getApiKey();
    return this.isValidApiKey(apiKey);
  }

  // Get maps provider display name
  getProviderDisplayName(): string {
    return this.provider === 'yandex' ? 'Yandex Maps' : 'Google Maps';
  }

  // Calculate region to fit all coordinates
  getRegionForCoordinates(coordinates: MapCoordinate[], padding: number = 0.1): MapRegion {
    if (coordinates.length === 0) {
      return {
        latitude: 5.6037, // Ghana - Accra
        longitude: -0.1870,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
    }

    if (coordinates.length === 1) {
      return {
        ...coordinates[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const latitudes = coordinates.map(c => c.latitude);
    const longitudes = coordinates.map(c => c.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = Math.max(maxLat - minLat, 0.01) * (1 + padding);
    const deltaLng = Math.max(maxLng - minLng, 0.01) * (1 + padding);
    
    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: deltaLat,
      longitudeDelta: deltaLng,
    };
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(coord1: MapCoordinate, coord2: MapCoordinate): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(coord2.latitude - coord1.latitude);
    const dLon = this.deg2rad(coord2.longitude - coord1.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1.latitude)) * Math.cos(this.deg2rad(coord2.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Generate static map URL for current provider
  getStaticMapUrl(
    center: MapCoordinate,
    zoom: number = 14,
    width: number = 300,
    height: number = 200,
    markers?: MapCoordinate[]
  ): string {
    if (this.provider === 'yandex') {
      return this.getYandexStaticMapUrl(center, zoom, width, height, markers);
    } else {
      return this.getGoogleStaticMapUrl(center, zoom, width, height, markers);
    }
  }

  private getYandexStaticMapUrl(
    center: MapCoordinate,
    zoom: number,
    width: number,
    height: number,
    markers?: MapCoordinate[]
  ): string {
    const baseUrl = 'https://static-maps.yandex.ru/1.x/';
    const params = new URLSearchParams({
      lang: 'en_US',
      size: `${width},${height}`,
      z: zoom.toString(),
      ll: `${center.longitude},${center.latitude}`,
      l: 'map'
    });

    if (markers && markers.length > 0) {
      const markerPoints = markers.map(m => `${m.longitude},${m.latitude}`).join('~');
      params.set('pt', markerPoints);
    }

    if (this.yandexApiKey) {
      params.set('apikey', this.yandexApiKey);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  private getGoogleStaticMapUrl(
    center: MapCoordinate,
    zoom: number,
    width: number,
    height: number,
    markers?: MapCoordinate[]
  ): string {
    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    const params = new URLSearchParams({
      center: `${center.latitude},${center.longitude}`,
      zoom: zoom.toString(),
      size: `${width}x${height}`,
      maptype: 'roadmap',
      key: this.googleApiKey || ''
    });

    if (markers && markers.length > 0) {
      markers.forEach((marker, index) => {
        params.append('markers', `color:red|${marker.latitude},${marker.longitude}`);
      });
    }

    return `${baseUrl}?${params.toString()}`;
  }

  // Get web maps URL for opening in browser
  getWebMapUrl(center: MapCoordinate, zoom: number = 14): string {
    if (this.provider === 'yandex') {
      return `https://yandex.com/maps/?ll=${center.longitude},${center.latitude}&z=${zoom}`;
    } else {
      return `https://www.google.com/maps/@${center.latitude},${center.longitude},${zoom}z`;
    }
  }

  // Get directions URL
  getDirectionsUrl(from: MapCoordinate, to: MapCoordinate): string {
    if (this.provider === 'yandex') {
      return `https://yandex.com/maps/?rtext=${from.latitude},${from.longitude}~${to.latitude},${to.longitude}&rtt=auto`;
    } else {
      return `https://www.google.com/maps/dir/${from.latitude},${from.longitude}/${to.latitude},${to.longitude}`;
    }
  }

  // Geocoding - convert address to coordinates
  async geocodeAddress(address: string): Promise<MapCoordinate | null> {
    try {
      if (this.provider === 'yandex') {
        return await this.yandexGeocode(address);
      } else {
        return await this.googleGeocode(address);
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  }

  private async yandexGeocode(address: string): Promise<MapCoordinate | null> {
    if (!this.yandexApiKey) {
      throw new Error('Yandex API key is required for geocoding');
    }

    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${this.yandexApiKey}&format=json&geocode=${encodeURIComponent(address)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const geoObject = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
    if (geoObject) {
      const coords = geoObject.Point.pos.split(' ');
      return {
        longitude: parseFloat(coords[0]),
        latitude: parseFloat(coords[1])
      };
    }
    
    return null;
  }

  private async googleGeocode(address: string): Promise<MapCoordinate | null> {
    if (!this.googleApiKey) {
      throw new Error('Google API key is required for geocoding');
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.googleApiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng
      };
    }
    
    return null;
  }

  // Reverse geocoding - convert coordinates to address
  async reverseGeocode(coordinate: MapCoordinate): Promise<string | null> {
    try {
      if (this.provider === 'yandex') {
        return await this.yandexReverseGeocode(coordinate);
      } else {
        return await this.googleReverseGeocode(coordinate);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  }

  private async yandexReverseGeocode(coordinate: MapCoordinate): Promise<string | null> {
    if (!this.yandexApiKey) {
      throw new Error('Yandex API key is required for reverse geocoding');
    }

    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${this.yandexApiKey}&format=json&geocode=${coordinate.longitude},${coordinate.latitude}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const geoObject = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
    if (geoObject) {
      return geoObject.metaDataProperty?.GeocoderMetaData?.text || null;
    }
    
    return null;
  }

  private async googleReverseGeocode(coordinate: MapCoordinate): Promise<string | null> {
    if (!this.googleApiKey) {
      throw new Error('Google API key is required for reverse geocoding');
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${this.googleApiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    
    return null;
  }
}

// Export singleton instance
export const mapsService = new MapsService();
export default mapsService;