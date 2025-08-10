// app/map.tsx - Seller Location Map Screen
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput
} from 'react-native';
import WebMapView from './components/WebMapView';
import { apiService, type SellerLocation } from './services/api';
import mapsService, { type MapRegion, type MarkerData } from './services/mapsService';

// Default location (Ghana - Accra)
const DEFAULT_REGION = {
  latitude: 5.6037,
  longitude: -0.1870,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function MapScreen() {
  const [sellers, setSellers] = useState<SellerLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<SellerLocation | null>(null);
  const [region, setRegion] = useState<MapRegion>(DEFAULT_REGION);
  const [showFilters, setShowFilters] = useState(false);
  const [showMapView, setShowMapView] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    country: 'Ghana'
  });

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSellersWithLocations(filters.city || filters.state || filters.country ? filters : undefined);
      setSellers(response.sellers);
      
      // If we have sellers, adjust the map to show them
      if (response.sellers.length > 0) {
        const coordinates = response.sellers.map(s => ({
          latitude: s.latitude,
          longitude: s.longitude
        }));
        
        const newRegion = mapsService.getRegionForCoordinates(coordinates, 0.2);
        setRegion(newRegion);
      }
    } catch (error) {
      console.error('Failed to load sellers:', error);
      Alert.alert('Error', 'Failed to load seller locations');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (seller: SellerLocation) => {
    setSelectedSeller(seller);
  };

  const handleSellerPress = (seller: SellerLocation) => {
    router.push(`/sellers/${seller.id}` as any);
  };

  const handleCallSeller = (seller: SellerLocation) => {
    // You could implement phone calling here
    Alert.alert('Contact Seller', `Would you like to message ${seller.shop_name || seller.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Message', onPress: () => router.push(`/chat/${seller.id}` as any) }
    ]);
  };

  const applyFilters = () => {
    setShowFilters(false);
    loadSellers();
  };

  const clearFilters = () => {
    setFilters({ city: '', state: '', country: 'Ghana' });
    setShowFilters(false);
    loadSellers();
  };

  // Convert sellers to map markers
  const mapMarkers: MarkerData[] = sellers.map(seller => ({
    id: seller.id.toString(),
    coordinate: {
      latitude: seller.latitude,
      longitude: seller.longitude
    },
    title: seller.shop_name || seller.name,
    description: `${seller.product_count} products • ⭐ ${seller.average_rating.toFixed(1)}`
  }));

  const handleMapMarkerPress = (markerId: string) => {
    const seller = sellers.find(s => s.id.toString() === markerId);
    if (seller) {
      setSelectedSeller(seller);
    }
  };

  const handleMapRegionChange = (newRegion: MapRegion) => {
    setRegion(newRegion);
  };

  const SellerCard = ({ seller }: { seller: SellerLocation }) => (
    <View style={styles.sellerCard}>
      <View style={styles.sellerInfo}>
        <Text style={styles.sellerName}>{seller.shop_name || seller.name}</Text>
        {seller.shop_address && (
          <Text style={styles.sellerAddress}>{seller.shop_address}</Text>
        )}
        <Text style={styles.sellerLocation}>
          {seller.shop_city}{seller.shop_state ? `, ${seller.shop_state}` : ''}
        </Text>
        <View style={styles.sellerStats}>
          <Text style={styles.productCount}>📦 {seller.product_count} products</Text>
          <Text style={styles.rating}>⭐ {seller.average_rating.toFixed(1)}</Text>
        </View>
        {seller.shop_description && (
          <Text style={styles.shopDescription} numberOfLines={2}>
            {seller.shop_description}
          </Text>
        )}
      </View>
      <View style={styles.sellerActions}>
        <TouchableOpacity
          style={styles.viewSellerButton}
          onPress={() => handleSellerPress(seller)}
        >
          <Text style={styles.viewSellerText}>View Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactSellerButton}
          onPress={() => handleCallSeller(seller)}
        >
          <Text style={styles.contactSellerText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Locations</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewToggleButton}
            onPress={() => setShowMapView(!showMapView)}
          >
            <Text style={styles.viewToggleText}>
              {showMapView ? '📋' : '🗺️'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterButtonText}>🔽</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Filter by Location</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="City"
            value={filters.city}
            onChangeText={(text) => setFilters(prev => ({ ...prev, city: text }))}
          />
          <TextInput
            style={styles.filterInput}
            placeholder="State/Region"
            value={filters.state}
            onChangeText={(text) => setFilters(prev => ({ ...prev, state: text }))}
          />
          <TextInput
            style={styles.filterInput}
            placeholder="Country"
            value={filters.country}
            onChangeText={(text) => setFilters(prev => ({ ...prev, country: text }))}
          />
          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyFiltersButton} onPress={applyFilters}>
              <Text style={styles.applyFiltersText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Map/List View Container */}
      <View style={styles.mapContainer}>
        {showMapView ? (
          /* Map View */
          <WebMapView
            region={region}
            markers={mapMarkers}
            onRegionChange={handleMapRegionChange}
            onMarkerPress={handleMapMarkerPress}
            style={styles.map}
          />
        ) : (
          /* List View */
          loading ? (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Loading sellers...</Text>
            </View>
          ) : (
            <ScrollView style={styles.sellersGrid} showsVerticalScrollIndicator={false}>
              <View style={styles.mapHeader}>
                <Text style={styles.mapHeaderText}>📍 Sellers Near You</Text>
                <Text style={styles.mapSubHeaderText}>
                  Found {sellers.length} sellers with locations
                </Text>
              </View>
              {sellers.map((seller) => (
                <TouchableOpacity
                  key={seller.id}
                  style={[
                    styles.mapSellerCard,
                    selectedSeller?.id === seller.id && styles.mapSellerCardSelected
                  ]}
                  onPress={() => handleMarkerPress(seller)}
                >
                  <View style={styles.mapSellerInfo}>
                    <Text style={styles.mapSellerName}>
                      {seller.shop_name || seller.name}
                    </Text>
                    <Text style={styles.mapSellerAddress}>
                      📍 {seller.shop_address}
                    </Text>
                    <Text style={styles.mapSellerLocation}>
                      {seller.shop_city}{seller.shop_state ? `, ${seller.shop_state}` : ''}
                    </Text>
                    <View style={styles.mapSellerStats}>
                      <Text style={styles.mapSellerProducts}>
                        📦 {seller.product_count} products
                      </Text>
                      <Text style={styles.mapSellerRating}>
                        ⭐ {seller.average_rating.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.mapSellerCoords}>
                      GPS: {seller.latitude.toFixed(4)}, {seller.longitude.toFixed(4)}
                    </Text>
                  </View>
                  <View style={styles.mapSellerActions}>
                    <TouchableOpacity
                      style={styles.mapViewButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSellerPress(seller);
                      }}
                    >
                      <Text style={styles.mapViewButtonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.mapContactButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleCallSeller(seller);
                      }}
                    >
                      <Text style={styles.mapContactButtonText}>Contact</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
              
              {sellers.length === 0 && (
                <View style={styles.emptyMapState}>
                  <Text style={styles.emptyMapText}>🗺️</Text>
                  <Text style={styles.emptyMapTitle}>No sellers with locations found</Text>
                  <Text style={styles.emptyMapSubtitle}>
                    Try adjusting your filters or check back later
                  </Text>
                </View>
              )}
            </ScrollView>
          )
        )}
      </View>

      {/* Selected Seller Card */}
      {selectedSeller && (
        <View style={styles.selectedSellerContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedSeller(null)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <SellerCard seller={selectedSeller} />
        </View>
      )}

      {/* Sellers List Toggle */}
      <View style={styles.sellersListContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sellersListContent}
        >
          {sellers.map((seller) => (
            <TouchableOpacity
              key={seller.id}
              style={[
                styles.sellerListItem,
                selectedSeller?.id === seller.id && styles.sellerListItemSelected
              ]}
              onPress={() => handleMarkerPress(seller)}
            >
              <Text style={styles.sellerListName}>{seller.shop_name || seller.name}</Text>
              <Text style={styles.sellerListLocation}>
                {seller.shop_city}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {sellers.length} sellers found
        </Text>
      </View>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleText: {
    fontSize: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 16,
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  filterInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  clearFiltersButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.45,
  },
  clearFiltersText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  applyFiltersButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.45,
  },
  applyFiltersText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  selectedSellerContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sellerInfo: {
    flex: 1,
    marginRight: 12,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sellerAddress: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  sellerLocation: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  sellerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productCount: {
    fontSize: 12,
    color: '#3b82f6',
  },
  rating: {
    fontSize: 12,
    color: '#f59e0b',
  },
  shopDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  sellerActions: {
    gap: 8,
  },
  viewSellerButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewSellerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  contactSellerButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contactSellerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  sellersListContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    height: 50,
  },
  sellersListContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sellerListItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
  },
  sellerListItemSelected: {
    backgroundColor: '#3b82f6',
  },
  sellerListName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sellerListLocation: {
    fontSize: 10,
    color: '#6b7280',
  },
  statsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  sellersGrid: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mapHeader: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  mapHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  mapSubHeaderText: {
    fontSize: 14,
    color: '#6b7280',
  },
  mapSellerCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapSellerCardSelected: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  mapSellerInfo: {
    flex: 1,
    marginRight: 12,
  },
  mapSellerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  mapSellerAddress: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  mapSellerLocation: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  mapSellerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mapSellerProducts: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  mapSellerRating: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  mapSellerCoords: {
    fontSize: 10,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  mapSellerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  mapViewButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  mapViewButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  mapContactButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  mapContactButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyMapState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyMapText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyMapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMapSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});