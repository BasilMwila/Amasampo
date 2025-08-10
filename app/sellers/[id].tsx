// app/sellers/[id].tsx - Seller Profile Page with Product Catalog
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { apiService, type Product, type SellerProfile } from '../services/api';

// Default images constant
const DEFAULT_IMAGES = {
  PRODUCT_PLACEHOLDER: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Image',
  USER_AVATAR: 'https://via.placeholder.com/100x100/f3f4f6/9ca3af?text=Shop'
};

export default function SellerProfileScreen() {
  const { id } = useLocalSearchParams();
  const sellerId = parseInt(id as string);
  
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; product_count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular' | 'rating'>('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (sellerId) {
      loadSellerProfile();
    }
  }, [sellerId, selectedCategory, sortBy]);

  const loadSellerProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSellerProfile(sellerId, {
        page: 1,
        limit: 20,
        category: selectedCategory,
        sort: sortBy
      });
      
      setSeller(response.seller);
      setProducts(response.products);
      setCategories(response.categories);
      setPage(1);
      setHasMore(response.pagination.has_next);
    } catch (error) {
      console.error('Failed to load seller profile:', error);
      Alert.alert('Error', 'Failed to load seller profile');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = page + 1;
      const response = await apiService.getSellerProfile(sellerId, {
        page: nextPage,
        limit: 20,
        category: selectedCategory,
        sort: sortBy
      });
      
      setProducts(prev => [...prev, ...response.products]);
      setPage(nextPage);
      setHasMore(response.pagination.has_next);
    } catch (error) {
      console.error('Failed to load more products:', error);
    }
  };

  const handleProductPress = (product: Product) => {
    router.push(`/products/${product.id}` as any);
  };

  const handleMessageSeller = () => {
    if (seller) {
      router.push(`/chat/${seller.id}` as any);
    }
  };

  const handleCallSeller = () => {
    if (seller?.phone) {
      Alert.alert(
        'Contact Seller',
        `Call ${seller.shop_name || seller.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => console.log('Call:', seller.phone) }
        ]
      );
    } else {
      Alert.alert('Contact Info', 'Phone number not available');
    }
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(product)}
      >
        <Image
          source={{
            uri: imageError || !product.image_url
              ? DEFAULT_IMAGES.PRODUCT_PLACEHOLDER
              : product.image_url
          }}
          style={styles.productImage}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
        
        {product.is_on_sale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>SALE</Text>
          </View>
        )}

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.categoryName}>{product.category_name}</Text>
          
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {(product.rating || 0).toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({product.review_count || 0})</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>${(product.price || 0).toFixed(2)}</Text>
            {product.original_price && product.original_price > (product.price || 0) && (
              <Text style={styles.originalPrice}>
                ${product.original_price.toFixed(2)}
              </Text>
            )}
          </View>
          
          <Text style={styles.quantity}>
            {(product.quantity || 0) > 0 
              ? `${product.quantity} available` 
              : 'Out of stock'
            }
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBusinessHours = () => {
    if (!seller?.business_hours) return null;

    try {
      const hours = typeof seller.business_hours === 'string' 
        ? JSON.parse(seller.business_hours) 
        : seller.business_hours;
      
      return (
        <View style={styles.businessHoursSection}>
          <Text style={styles.sectionTitle}>🕒 Business Hours</Text>
          <View style={styles.businessHours}>
            {Object.entries(hours).map(([day, time]) => (
              <View key={day} style={styles.businessHourRow}>
                <Text style={styles.dayText}>{day}</Text>
                <Text style={styles.timeText}>{time as string}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    } catch (error) {
      return null;
    }
  };

  if (loading && !seller) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading seller profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!seller) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Seller not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Seller Info */}
        <View style={styles.sellerSection}>
          <View style={styles.sellerHeader}>
            <Image
              source={{
                uri: seller.avatar_url || DEFAULT_IMAGES.USER_AVATAR
              }}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>
                {seller.shop_name || seller.name}
              </Text>
              {seller.shop_name && (
                <Text style={styles.sellerOwner}>by {seller.name}</Text>
              )}
              <View style={styles.sellerStats}>
                <Text style={styles.statText}>📦 {seller.product_count} products</Text>
                <Text style={styles.statText}>⭐ {seller.average_rating.toFixed(1)}</Text>
                <Text style={styles.statText}>📋 {seller.total_orders} orders</Text>
              </View>
            </View>
          </View>

          {/* Shop Description */}
          {seller.shop_description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About the Shop</Text>
              <Text style={styles.description}>{seller.shop_description}</Text>
            </View>
          )}

          {/* Location */}
          {seller.shop_address && (
            <View style={styles.locationSection}>
              <Text style={styles.sectionTitle}>📍 Location</Text>
              <Text style={styles.address}>{seller.shop_address}</Text>
              <Text style={styles.cityState}>
                {seller.shop_city}{seller.shop_state ? `, ${seller.shop_state}` : ''}
                {seller.shop_country ? ` • ${seller.shop_country}` : ''}
              </Text>
              {seller.latitude && seller.longitude && (
                <Text style={styles.coordinates}>
                  GPS: {seller.latitude.toFixed(4)}, {seller.longitude.toFixed(4)}
                </Text>
              )}
            </View>
          )}

          {/* Business Hours */}
          {renderBusinessHours()}

          {/* Contact Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.messageButton} onPress={handleMessageSeller}>
              <Text style={styles.messageButtonText}>💬 Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callButton} onPress={handleCallSeller}>
              <Text style={styles.callButtonText}>📞 Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Categories */}
        {categories.length > 0 && (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Product Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'all' && styles.categoryButtonSelected
                ]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === 'all' && styles.categoryTextSelected
                ]}>
                  All ({seller.product_count})
                </Text>
              </TouchableOpacity>
              
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.name && styles.categoryButtonSelected
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.name && styles.categoryTextSelected
                  ]}>
                    {category.name} ({category.product_count})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Sort Options */}
        <View style={styles.sortSection}>
          <Text style={styles.sortTitle}>Sort by:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortScroll}
          >
            {[
              { key: 'newest', label: 'Newest' },
              { key: 'price_low', label: 'Price: Low to High' },
              { key: 'price_high', label: 'Price: High to Low' },
              { key: 'popular', label: 'Popular' },
              { key: 'rating', label: 'Rating' }
            ].map((sort) => (
              <TouchableOpacity
                key={sort.key}
                style={[
                  styles.sortButton,
                  sortBy === sort.key && styles.sortButtonSelected
                ]}
                onPress={() => setSortBy(sort.key as any)}
              >
                <Text style={[
                  styles.sortText,
                  sortBy === sort.key && styles.sortTextSelected
                ]}>
                  {sort.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            Products ({products.length})
          </Text>
          
          {products.length > 0 ? (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <ProductCard product={item} />}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMoreProducts}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() => (
                hasMore && !loading ? (
                  <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreProducts}>
                    <Text style={styles.loadMoreText}>Load More Products</Text>
                  </TouchableOpacity>
                ) : null
              )}
            />
          ) : (
            <View style={styles.emptyProducts}>
              <Text style={styles.emptyProductsText}>📦</Text>
              <Text style={styles.emptyProductsTitle}>No products found</Text>
              <Text style={styles.emptyProductsSubtitle}>
                This seller hasn't added any products yet or they don't match your filters.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const productCardWidth = (width - 60) / 2; // Account for margins and padding

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
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  sellerSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sellerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    marginRight: 16,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sellerOwner: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  sellerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  locationSection: {
    marginBottom: 20,
  },
  address: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  cityState: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 10,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  businessHoursSection: {
    marginBottom: 20,
  },
  businessHours: {
    gap: 4,
  },
  businessHourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  dayText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoriesScroll: {
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  categoryButtonSelected: {
    backgroundColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  sortSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sortTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  sortScroll: {
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  sortButtonSelected: {
    backgroundColor: '#e5e7eb',
  },
  sortText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  sortTextSelected: {
    color: '#374151',
    fontWeight: '600',
  },
  productsSection: {
    padding: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: productCardWidth,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginBottom: 8,
  },
  saleBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saleBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  productInfo: {
    gap: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  categoryName: {
    fontSize: 10,
    color: '#9ca3af',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 10,
    color: '#f59e0b',
  },
  reviewCount: {
    fontSize: 10,
    color: '#9ca3af',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  originalPrice: {
    fontSize: 10,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  quantity: {
    fontSize: 10,
    color: '#6b7280',
  },
  loadMoreButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  loadMoreText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyProductsText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyProductsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyProductsSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});