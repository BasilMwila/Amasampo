// app/components/WebMapView.tsx - WebView-based map component for both Yandex and Google Maps
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import mapsService, { type MapCoordinate, type MapRegion, type MarkerData } from '../services/mapsService';

export interface WebMapViewProps {
  region: MapRegion;
  markers?: MarkerData[];
  onRegionChange?: (region: MapRegion) => void;
  onMarkerPress?: (markerId: string) => void;
  style?: any;
  showUserLocation?: boolean;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
}

export default function WebMapView({
  region,
  markers = [],
  onRegionChange,
  onMarkerPress,
  style,
  showUserLocation = false,
  scrollEnabled = true,
  zoomEnabled = true
}: WebMapViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Add timeout for loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('🗺️ Map loading timeout, stopping loader');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  const generateMapHTML = () => {
    const provider = mapsService.getProvider();
    const apiKey = mapsService.getApiKey();

    console.log('🗺️ Map Debug:', {
      provider,
      hasValidKey: mapsService.hasValidApiKey(),
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'null'
    });

    if (!mapsService.hasValidApiKey()) {
      console.log('🗺️ No valid API key for current provider, trying alternative...');
      
      // Try to switch to alternative provider
      if (provider === 'yandex') {
        console.log('🗺️ Switching to Google Maps as fallback');
        mapsService.setProvider('google');
        if (mapsService.hasValidApiKey()) {
          return generateGoogleMapHTML(mapsService.getApiKey());
        }
      } else {
        console.log('🗺️ Switching to Yandex Maps as fallback');
        mapsService.setProvider('yandex');
        if (mapsService.hasValidApiKey()) {
          return generateYandexMapHTML(mapsService.getApiKey());
        }
      }
      
      console.log('🗺️ No valid API keys found, showing fallback');
      return generateFallbackHTML();
    }

    if (provider === 'yandex') {
      console.log('🗺️ Using Yandex Maps');
      return generateYandexMapHTML(apiKey);
    } else {
      console.log('🗺️ Using Google Maps');
      return generateGoogleMapHTML(apiKey);
    }
  };

  const generateFallbackHTML = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                margin: 0; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: #f8f9fa;
                text-align: center;
                padding: 20px;
                box-sizing: border-box;
            }
            .fallback-container {
                background: white;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                max-width: 300px;
            }
            .map-icon { font-size: 48px; margin-bottom: 16px; }
            .title { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }
            .subtitle { font-size: 14px; color: #6b7280; line-height: 1.4; }
            .markers-list { margin-top: 20px; text-align: left; }
            .marker-item { 
                background: #f3f4f6; 
                padding: 10px; 
                margin: 8px 0; 
                border-radius: 8px;
                cursor: pointer;
                border: 1px solid #e5e7eb;
            }
            .marker-item:hover { background: #e5e7eb; }
            .marker-title { font-weight: 600; font-size: 14px; color: #1a1a1a; }
            .marker-desc { font-size: 12px; color: #6b7280; margin-top: 4px; }
        </style>
    </head>
    <body>
        <div class="fallback-container">
            <div class="map-icon">🗺️</div>
            <div class="title">Map Not Available</div>
            <div class="subtitle">
                Please add your ${mapsService.getProviderDisplayName()} API key to enable the map view
            </div>
            ${markers.length > 0 ? `
                <div class="markers-list">
                    ${markers.map(marker => `
                        <div class="marker-item" onclick="handleMarkerPress('${marker.id}')">
                            <div class="marker-title">${marker.title}</div>
                            <div class="marker-desc">${marker.description}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        
        <script>
            function handleMarkerPress(markerId) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'markerPress',
                    markerId: markerId
                }));
            }
        </script>
    </body>
    </html>
    `;
  };

  const generateYandexMapHTML = (apiKey: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=en_US" type="text/javascript"></script>
        <style>
            body { margin: 0; }
            #mapContainer { width: 100%; height: 100vh; }
            .marker-balloon { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
        </style>
    </head>
    <body>
        <div id="mapContainer"></div>
        
        <script type="text/javascript">
            let map;
            let markers = [];
            
            ymaps.ready(function() {
                map = new ymaps.Map("mapContainer", {
                    center: [${region.latitude}, ${region.longitude}],
                    zoom: ${Math.round(10 - Math.log(region.latitudeDelta) / Math.LN2)},
                    controls: ['zoomControl', 'fullscreenControl']
                }, {
                    searchControlProvider: 'yandex#search',
                    ${!scrollEnabled ? 'scrollZoom: false,' : ''}
                    ${!zoomEnabled ? 'zoomControl: false,' : ''}
                });

                // Add markers
                ${markers.map(marker => `
                    addMarker(${marker.coordinate.latitude}, ${marker.coordinate.longitude}, "${marker.title}", "${marker.description}", "${marker.id}");
                `).join('')}

                // Listen for map events
                map.events.add('boundschange', function(e) {
                    const bounds = map.getBounds();
                    const center = map.getCenter();
                    const zoom = map.getZoom();
                    
                    const latDelta = bounds[1][0] - bounds[0][0];
                    const lngDelta = bounds[1][1] - bounds[0][1];
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'regionChange',
                        region: {
                            latitude: center[0],
                            longitude: center[1],
                            latitudeDelta: latDelta,
                            longitudeDelta: lngDelta
                        }
                    }));
                });
                
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
            });
            
            function addMarker(lat, lng, title, description, id) {
                const placemark = new ymaps.Placemark([lat, lng], {
                    balloonContent: '<div class="marker-balloon"><strong>' + title + '</strong><br>' + description + '</div>',
                    hintContent: title
                }, {
                    preset: 'islands#redIcon'
                });
                
                placemark.events.add('click', function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'markerPress',
                        markerId: id
                    }));
                });
                
                map.geoObjects.add(placemark);
                markers.push(placemark);
            }
            
            // Handle messages from React Native
            window.addEventListener('message', function(event) {
                const data = JSON.parse(event.data);
                
                if (data.type === 'updateRegion') {
                    map.setCenter([data.region.latitude, data.region.longitude]);
                    map.setZoom(Math.round(10 - Math.log(data.region.latitudeDelta) / Math.LN2));
                }
                
                if (data.type === 'updateMarkers') {
                    // Clear existing markers
                    markers.forEach(marker => map.geoObjects.remove(marker));
                    markers = [];
                    
                    // Add new markers
                    data.markers.forEach(marker => {
                        addMarker(marker.coordinate.latitude, marker.coordinate.longitude, 
                                 marker.title, marker.description, marker.id);
                    });
                }
            });
        </script>
    </body>
    </html>
    `;
  };

  const generateGoogleMapHTML = (apiKey: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { margin: 0; }
            #mapContainer { width: 100%; height: 100vh; }
        </style>
    </head>
    <body>
        <div id="mapContainer"></div>
        
        <script>
            let map;
            let markers = [];
            let infoWindow;
            
            function initMap() {
                map = new google.maps.Map(document.getElementById("mapContainer"), {
                    zoom: ${Math.round(10 - Math.log(region.latitudeDelta) / Math.LN2)},
                    center: { lat: ${region.latitude}, lng: ${region.longitude} },
                    ${!scrollEnabled ? 'scrollwheel: false, draggable: false,' : ''}
                    ${!zoomEnabled ? 'disableDoubleClickZoom: true, zoomControl: false,' : ''}
                });

                infoWindow = new google.maps.InfoWindow();

                // Add markers
                ${markers.map(marker => `
                    addMarker(${marker.coordinate.latitude}, ${marker.coordinate.longitude}, "${marker.title}", "${marker.description}", "${marker.id}");
                `).join('')}

                // Listen for map events
                map.addListener("bounds_changed", function() {
                    const bounds = map.getBounds();
                    const center = map.getCenter();
                    
                    if (bounds) {
                        const ne = bounds.getNorthEast();
                        const sw = bounds.getSouthWest();
                        
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'regionChange',
                            region: {
                                latitude: center.lat(),
                                longitude: center.lng(),
                                latitudeDelta: ne.lat() - sw.lat(),
                                longitudeDelta: ne.lng() - sw.lng()
                            }
                        }));
                    }
                });
                
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
            }
            
            function addMarker(lat, lng, title, description, id) {
                const marker = new google.maps.Marker({
                    position: { lat: lat, lng: lng },
                    map: map,
                    title: title
                });
                
                marker.addListener("click", function() {
                    infoWindow.setContent('<div><strong>' + title + '</strong><br>' + description + '</div>');
                    infoWindow.open(map, marker);
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'markerPress',
                        markerId: id
                    }));
                });
                
                markers.push(marker);
            }
            
            // Handle messages from React Native
            window.addEventListener('message', function(event) {
                const data = JSON.parse(event.data);
                
                if (data.type === 'updateRegion') {
                    map.setCenter({ lat: data.region.latitude, lng: data.region.longitude });
                    map.setZoom(Math.round(10 - Math.log(data.region.latitudeDelta) / Math.LN2));
                }
                
                if (data.type === 'updateMarkers') {
                    // Clear existing markers
                    markers.forEach(marker => marker.setMap(null));
                    markers = [];
                    
                    // Add new markers
                    data.markers.forEach(marker => {
                        addMarker(marker.coordinate.latitude, marker.coordinate.longitude, 
                                 marker.title, marker.description, marker.id);
                    });
                }
            });

            window.initMap = initMap;
        </script>
        
        <script async defer 
            src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap">
        </script>
    </body>
    </html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('🗺️ WebView message:', data);
      
      switch (data.type) {
        case 'mapReady':
          console.log('🗺️ Map is ready!');
          setIsLoading(false);
          setHasError(false);
          break;
          
        case 'regionChange':
          if (onRegionChange) {
            onRegionChange(data.region);
          }
          break;
          
        case 'markerPress':
          if (onMarkerPress) {
            onMarkerPress(data.markerId);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const updateRegion = (newRegion: MapRegion) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'updateRegion',
        region: newRegion
      }));
    }
  };

  const updateMarkers = (newMarkers: MarkerData[]) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'updateMarkers',
        markers: newMarkers
      }));
    }
  };

  // Note: Methods can be called directly on the component instance if needed

  if (hasError) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Map Error</Text>
          <Text style={styles.errorMessage}>
            Failed to load {mapsService.getProviderDisplayName()}. Please check your API key and internet connection.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.webView}
        onMessage={handleMessage}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading {mapsService.getProviderDisplayName()}...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});