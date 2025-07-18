/* eslint-disable react-hooks/exhaustive-deps */
// app/products/[id].tsx - Product detail screen with real API integration
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../_layout';
import { COLORS, DEFAULT_IMAGES, ERROR_MESSAGES } from '../constants/constants';
import { apiService, type Product } from '../services/api';

interface Review {
  id: number;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(1);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      loadProductData();
    }
  }, [id]);

  const loadProductData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [productResponse, reviewsResponse] = await Promise.all([
        apiService.getProduct(parseInt(id!)),
        apiService.getProductReviews(parseInt(id!), 1),
      ]);

      setProduct(productResponse.product);
      setReviews(reviewsResponse.reviews || []);
    } catch (error: any) {
      console.error('Failed to load product:', error);
      Alert.alert('Error', error.message || ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !user) return;

    if (user.user_type !== 'buyer') {
      Alert.alert('Access Denied', 'Only buyers can add items to cart');
      return;
    }

    if (product.seller_id === user.id) {
      Alert.alert('Invalid Action', 'You cannot add your own product to cart');
      return;
    }

    if (product.quantity < cartQuantity) {
      Alert.alert('Insufficient Stock', `Only ${product.quantity} items available`);
      return;
    }

    try {
      setAddingToCart(true);
      await apiService.addToCart(product.id, cartQuantity);
      
      Alert.alert(
        'Success!',
        `${cartQuantity} ${product.name}${cartQuantity > 1 ? 's' : ''} added to cart`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { 
            text: 'View Cart', 
            onPress: () => router.push('/(tabs)/cart' as any)
          }
        ]
      );
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      Alert.alert('Error', error.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleMessageSeller = () => {
    if (!product || !user) return;

    if (product.seller_id === user.id) {
      Alert.alert('Invalid Action', 'You cannot message yourself');
      return;
    }

    router.push(`/chat/${product.seller_id}` as any);
  };

  const handleBuyNow = () => {
    if (!product || !user) return;

    if (user.user_type !== 'buyer') {
      Alert.alert('Access Denied', 'Only buyers can purchase items');
      return;
    }

    if (product.seller_id === user.id) {
      Alert.alert('Invalid Action', 'You cannot buy your own product');
      return;
    }

    // Add to cart and go to checkout
    handleAddToCart().then(() => {
      router.push('/checkout' as any);
    });
  };

  const updateCartQuantity = (change: number) => {
    const newQuantity = cartQuantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 0)) {
      setCartQuantity(newQuantity);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push('☆');
    }

    return stars.join('');
  };

  const ReviewItem = ({ review }: { review: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{review.user_name}</Text>
        <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
      </View>
      <View style={styles.reviewRating}>
        <Text style={styles.reviewStars}>{renderStars(review.rating)}</Text>
        <Text style={styles.reviewTitle}>{review.title}</Text>
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnProduct = user?.id === product.seller_id;
  const canPurchase = user?.user_type === 'buyer' && !isOwnProduct;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProductData(true)}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image_url || DEFAULT_IMAGES.PRODUCT_PLACEHOLDER }}
            style={styles.productImage}
            defaultSource={{ uri: DEFAULT_IMAGES.PRODUCT_PLACEHOLDER }}
          />
          {product.quantity === 0 && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>${product.price?.toFixed(2)}</Text>
              <Text style={styles.productQuantity}>
                {product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
              </Text>
            </View>

            {product.rating && product.rating > 0 && (
              <View style={styles.ratingRow}>
                <Text style={styles.ratingStars}>{renderStars(product.rating)}</Text>
                <Text style={styles.ratingText}>
                  {product.rating.toFixed(1)} ({product.review_count || 0} reviews)
                </Text>
              </View>
            )}
          </View>

          {/* Seller Info */}
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerLabel}>Sold by</Text>
            <View style={styles.sellerRow}>
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>{product.seller_name}</Text>
                {product.shop_name && (
                  <Text style={styles.shopName}>{product.shop_name}</Text>
                )}
              </View>
              {!isOwnProduct && (
                <TouchableOpacity
                  style={styles.messageSellerButton}
                  onPress={handleMessageSeller}
                >
                  <Text style={styles.messageSellerText}>Message</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quantity Selector for Buyers */}
          {canPurchase && product.quantity > 0 && (
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={[styles.quantityButton, cartQuantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={() => updateCartQuantity(-1)}
                  disabled={cartQuantity <= 1}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{cartQuantity}</Text>
                <TouchableOpacity
                  style={[styles.quantityButton, cartQuantity >= product.quantity && styles.quantityButtonDisabled]}
                  onPress={() => updateCartQuantity(1)}
                  disabled={cartQuantity >= product.quantity}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {reviews.slice(0, 3).map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {canPurchase && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.addToCartButton, (addingToCart || product.quantity === 0) && styles.buttonDisabled]}
            onPress={handleAddToCart}
            disabled={addingToCart || product.quantity === 0}
          >
            {addingToCart ? (
              <ActivityIndicator size="small" color={COLORS.CARD} />
            ) : (
              <Text style={styles.addToCartText}>Add to Cart</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buyNowButton, product.quantity === 0 && styles.buttonDisabled]}
            onPress={handleBuyNow}
            disabled={product.quantity === 0}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {isOwnProduct && (
        <View style={styles.ownProductActions}>
          <TouchableOpacity
            style={styles.editProductButton}
            onPress={() => router.push(`/products/edit/${product.id}` as any)}
          >
            <Text style={styles.editProductText}>Edit Product</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.CARD,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
    backgroundColor: COLORS.CARD,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: COLORS.CARD,
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  productInfo: {
    marginBottom: 24,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
    lineHeight: 32,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  productQuantity: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingStars: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  sellerInfo: {
    backgroundColor: COLORS.CARD,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sellerLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  sellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  shopName: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  messageSellerButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  messageSellerText: {
    color: COLORS.CARD,
    fontSize: 14,
    fontWeight: '600',
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.CARD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    minWidth: 40,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 24,
  },
  reviewsSection: {
    marginBottom: 24,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  reviewItem: {
    backgroundColor: COLORS.CARD,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.TEXT_MUTED,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reviewStars: {
    fontSize: 14,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    backgroundColor: COLORS.CARD,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    color: COLORS.CARD,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  ownProductActions: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: COLORS.CARD,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  editProductButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editProductText: {
    color: COLORS.CARD,
    fontSize: 16,
    fontWeight: '600',
  },
});