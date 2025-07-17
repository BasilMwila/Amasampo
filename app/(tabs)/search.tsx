/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// File: app/(tabs)/search.tsx - Updated with Real API Integration
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../_layout';
import { apiService } from '../services/api';

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

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (searchQuery.trim() || selectedCategory !== 'All') {
      performSearch();
    } else {
      setProducts([]);
    }
  }, [searchQuery, selectedCategory]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      
      if (selectedCategory !== 'All') {
        filters.category = selectedCategory;
      }

      const response = await apiService.getProducts(filters);
      setProducts(response.products || []);
    } catch (error) {
      console.error('Search failed:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: Product) => {
    router.push(`/products/${product.id}` as any);
  }};