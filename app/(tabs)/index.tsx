/* eslint-disable react-hooks/exhaustive-deps */
 
// File: app/(tabs)/index.tsx - Fixed image handling
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../_layout';
import { CATEGORIES } from '../constants/constants';
import { apiService, type Product } from '../services/api';

// Default images constant
const DEFAULT_IMAGES = {
  PRODUCT_PLACEHOLDER: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Image',
  USER_AVATAR: 'https://via.placeholder.com/100x100/f3f4f6/9ca3af?text=User'
};

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [cartCount] = useState(3); // This will come from cart context
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Build filters based on selected category
      const filters: {
        category_id?: number;
        is_featured?: boolean;
        page?: number;
        limit?: number;
      } = {};
      
      // For now, we'll just load all products and filter client-side
      // In a real app, you'd want to get category IDs from the API
      if (selectedCategory !== 'All') {
        // You would need to map category names to IDs here
        // For now, we'll filter client-side
      }
      
      const response = await apiService.getProducts(filters);
      setProducts(response.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      // Fallback to empty array on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category_name === selectedCategory;
    return matchesCategory;
  });

  const featuredProducts = products.filter(product => product.is_featured);
  const onSaleProducts = products.filter(product => product.is_on_sale);

  const handleProductPress = (product: Product) => {
    router.push(`/products/${product.id}` as any);
  };

  const handleMessageSeller = (sellerId: number) => {
    router.push(`/chat/${sellerId}` as any);
  };

  const handleSearch = () => {
    router.push('/search' as any);
  };

  const handleCart = () => {
    router.push('/(tabs)/cart' as any);
  };

  const handleNotifications = () => {
    router.push('/notifications' as any);
  };

  const ProductCard = ({ product, isHorizontal = false }: { product: Product; isHorizontal?: boolean }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageError = () => {
      console.log('Image failed to load for product:', product.name);
      setImageError(true);
      setImageLoading(false);
    };

    const handleImageLoad = () => {
      setImageLoading(false);
      setImageError(false);
    };

    // Determine which image to show
    const getImageSource = () => {
      if (!product.image_url || imageError) {
        return { uri: DEFAULT_IMAGES.PRODUCT_PLACEHOLDER };
      }
      return { uri: product.image_url };
    };

    return (
      <TouchableOpacity
        style={[styles.productCard, isHorizontal && styles.horizontalCard]}
        onPress={() => handleProductPress(product)}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={getImageSource()}
            style={[styles.productImage, isHorizontal && styles.horizontalImage]} 
            defaultSource={{ uri: DEFAULT_IMAGES.PRODUCT_PLACEHOLDER }}
            onError={handleImageError}
            onLoad={handleImageLoad}
            onLoadStart={() => setImageLoading(true)}
            resizeMode="cover"
          />
          {imageLoading && (
            <View style={styles.imageLoadingOverlay}>
              <Text style={styles.imageLoadingText}>📷</Text>
            </View>
          )}
          {product.is_on_sale === true && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>SALE</Text>
            </View>
          )}
          {product.is_featured === true && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>⭐</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{product.name || ''}</Text>
          <Text style={styles.sellerName}>{product.seller_name || ''}</Text>
          
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {product.rating || 0}</Text>
            <Text style={styles.distance}>{product.distance || 0}km</Text>
          </View>
          
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.productPrice}>${product.price?.toFixed(2) || '0.00'}</Text>
              {product.original_price && product.original_price > 0 && (
                <Text style={styles.originalPrice}>${product.original_price.toFixed(2)}</Text>
              )}
            </View>
            <Text style={styles.productQuantity}>
              {product.quantity > 0 ? `${product.quantity} left` : 'Out of stock'}
            </Text>
          </View>

          {user?.user_type === 'buyer' && product.seller_id !== user.id && (
            <TouchableOpacity
              style={styles.messageButton}
              onPress={(e) => {
                e.stopPropagation();
                handleMessageSeller(product.seller_id);
              }}
            >
              <Text style={styles.messageButtonText}>Message Seller</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.headerTitle}>{user?.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleNotifications}>
              <Text style={styles.headerButtonIcon}>🔔</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
            {user?.user_type === 'buyer' && (
              <TouchableOpacity style={styles.headerButton} onPress={handleCart}>
                <Text style={styles.headerButtonIcon}>🛒</Text>
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <TouchableOpacity style={styles.searchContainer} onPress={handleSearch}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search products, sellers...</Text>
            <Text style={styles.filterIcon}>⚙️</Text>
          </View>
        </TouchableOpacity>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {['All', ...CATEGORIES].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonSelected,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.categoryIcon}>
                {category === 'All' ? '🏪' :
                 category === 'Electronics' ? '📱' :
                 category === 'Clothing' ? '👕' :
                 category === 'Food' ? '🍎' :
                 category === 'Home & Garden' ? '🏡' :
                 category === 'Sports & Recreation' ? '⚽' :
                 category === 'Books & Media' ? '📚' :
                 category === 'Toys & Games' ? '🧸' :
                 category === 'Health & Beauty' ? '💄' :
                 category === 'Automotive' ? '🚗' :
                 category === 'Arts & Crafts' ? '🎨' :
                 category === 'Services' ? '🔧' : '📦'}
              </Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
              <TouchableOpacity onPress={() => router.push('/search' as any)}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} isHorizontal />
              ))}
            </ScrollView>
          </View>
        )}

        {/* On Sale Products */}
        {onSaleProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔥 On Sale</Text>
              <TouchableOpacity onPress={() => router.push('/search' as any)}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {onSaleProducts.map((product) => (
                <ProductCard key={product.id} product={product} isHorizontal />
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </Text>
            <Text style={styles.productCount}>
              {filteredProducts.length} products
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <ProductCard product={item} />}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No products found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Try adjusting your search or category filter
                  </Text>
                </View>
              }
            />
          )}
        </View>

        {/* Quick Actions for Sellers */}
        {user?.user_type === 'seller' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => router.push('/(tabs)/product' as any)}
              >
                <Text style={styles.quickActionIcon}>➕</Text>
                <Text style={styles.quickActionText}>Add Product</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => router.push('/orders' as any)}
              >
                <Text style={styles.quickActionIcon}>📦</Text>
                <Text style={styles.quickActionText}>View Orders</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => router.push('/dashboard' as any)}
              >
                <Text style={styles.quickActionIcon}>📊</Text>
                <Text style={styles.quickActionText}>Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonIcon: {
    fontSize: 18,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6b7280',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#9ca3af',
  },
  filterIcon: {
    fontSize: 16,
    color: '#6b7280',
  },
  categoryContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    minWidth: 80,
  },
  categoryButtonSelected: {
    backgroundColor: '#3b82f6',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  productCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  horizontalList: {
    paddingRight: 20,
    gap: 16,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  horizontalCard: {
    width: 200,
    marginBottom: 0,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  horizontalImage: {
    height: 120,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageLoadingText: {
    fontSize: 32,
    color: '#9ca3af',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  saleBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadgeText: {
    fontSize: 12,
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sellerName: {
    fontSize: 12,
    color: '#6b7280',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#f59e0b',
  },
  distance: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  productQuantity: {
    fontSize: 12,
    color: '#6b7280',
  },
  messageButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  messageButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});