/* eslint-disable @typescript-eslint/no-unused-vars */
// File: app/(tabs)/search.tsx
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
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

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products] = useState<Product[]>(mockProducts);
  const { user } = useAuth();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}` as any);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
    >
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.sellerName}>{product.sellerName}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {product.rating}</Text>
          <Text style={styles.distance}>{product.distance}km</Text>
        </View>
        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
        <Text style={styles.productQuantity}>
          {product.quantity > 0 ? `${product.quantity} left` : 'Out of stock'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products, sellers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonSelected,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} results
        </Text>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateTitle}>No products found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your search terms or category filter
            </Text>
          </View>
        }
      />
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoryContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  categoryButtonSelected: {
    backgroundColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  resultsHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultsText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    color: '#f59e0b',
  },
  distance: {
    fontSize: 12,
    color: '#6b7280',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});