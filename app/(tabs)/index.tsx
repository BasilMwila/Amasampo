/* eslint-disable @typescript-eslint/no-unused-vars */
// File: app/(tabs)/index.tsx - Updated with new features
import { router } from 'expo-router';
import React, { useState } from 'react';
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

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  sellerId: number;
  sellerName: string;
  shopName?: string;
  category: string;
  image: string;
  description?: string;
  rating: number;
  reviewCount: number;
  distance: number;
  isFeatured?: boolean;
  isOnSale?: boolean;
  originalPrice?: number;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Organic Apples',
    price: 2.99,
    quantity: 50,
    sellerId: 1,
    sellerName: 'John Smith',
    shopName: 'Smith Farm Market',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop',
    description: 'Fresh organic apples from local farm',
    rating: 4.8,
    reviewCount: 23,
    distance: 2.3,
    isFeatured: true,
  },
  {
    id: 2,
    name: 'Fresh Bread',
    price: 3.50,
    quantity: 20,
    sellerId: 2,
    sellerName: 'Mary Johnson',
    shopName: "Mary's Bakery",
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop',
    description: 'Freshly baked daily',
    rating: 4.9,
    reviewCount: 45,
    distance: 1.2,
    isOnSale: true,
    originalPrice: 4.00,
  },
  {
    id: 3,
    name: 'Local Honey',
    price: 8.99,
    quantity: 15,
    sellerId: 1,
    sellerName: 'John Smith',
    shopName: 'Smith Farm Market',
    category: 'Pantry',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=200&fit=crop',
    description: 'Pure local honey',
    rating: 4.7,
    reviewCount: 18,
    distance: 2.3,
    isFeatured: true,
  },
  {
    id: 4,
    name: 'Organic Tomatoes',
    price: 4.25,
    quantity: 30,
    sellerId: 3,
    sellerName: 'Farm Fresh Co',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1546470427-e2c0531b47e4?w=300&h=200&fit=crop',
    description: 'Vine-ripened organic tomatoes',
    rating: 4.6,
    reviewCount: 12,
    distance: 5.1,
  },
];

const categories = ['All', 'Fruits', 'Vegetables', 'Bakery', 'Dairy', 'Pantry'];

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartCount] = useState(3); // Would be from context/state in real app
  const { user } = useAuth();

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesCategory;
  });

  const featuredProducts = products.filter(product => product.isFeatured);
  const onSaleProducts = products.filter(product => product.isOnSale);

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}` as any);
  };

  const handleMessageSeller = (sellerId: number) => {
    router.push(`/chat/${sellerId}` as any);
  };

  const handleSearch = () => {
    router.push('/(tabs)/search' as any);
  };

  const handleCart = () => {
    router.push('/(tabs)/cart' as any);
  };

  const handleNotifications = () => {
    router.push('/notifications' as any);
  };

  const ProductCard = ({ product, isHorizontal = false }: { product: Product; isHorizontal?: boolean }) => (
    <TouchableOpacity
      style={[styles.productCard, isHorizontal && styles.horizontalCard]}
      onPress={() => handleProductPress(product)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={[styles.productImage, isHorizontal && styles.horizontalImage]} />
        {product.isOnSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>SALE</Text>
          </View>
        )}
        {product.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>⭐</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.sellerName}>{product.sellerName}</Text>
        
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {product.rating}</Text>
          <Text style={styles.distance}>{product.distance}km</Text>
        </View>
        
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
            )}
          </View>
          <Text style={styles.productQuantity}>
            {product.quantity > 0 ? `${product.quantity} left` : 'Out of stock'}
          </Text>
        </View>

        {user?.type === 'buyer' && product.sellerId !== user.id && (
          <TouchableOpacity
            style={styles.messageButton}
            onPress={(e) => {
              e.stopPropagation();
              handleMessageSeller(product.sellerId);
            }}
          >
            <Text style={styles.messageButtonText}>Message Seller</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

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
            {user?.type === 'buyer' && (
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
          {categories.map((category) => (
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
                 category === 'Fruits' ? '🍎' :
                 category === 'Vegetables' ? '🥕' :
                 category === 'Bakery' ? '🍞' :
                 category === 'Dairy' ? '🧀' : '🥫'}
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
              <TouchableOpacity onPress={() => router.push('/(tabs)/search' as any)}>
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
              <TouchableOpacity onPress={() => router.push('/(tabs)/search' as any)}>
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
        </View>

        {/* Quick Actions for Sellers */}
        {user?.type === 'seller' && (
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
    shadowColor: '#fff',
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
  },
  horizontalImage: {
    height: 120,
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