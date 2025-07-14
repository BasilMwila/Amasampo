import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
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
  description: string;
  createdAt: string;
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
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop',
    description: 'Fresh organic apples directly from our farm. These crisp, sweet apples are perfect for snacking, baking, or making fresh juice. Grown without pesticides using sustainable farming practices. Each apple is hand-picked at peak ripeness to ensure the best quality and flavor.',
    createdAt: '2024-01-15T10:30:00Z'
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
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    description: 'Artisan sourdough bread baked fresh daily using traditional methods. Made with organic flour, natural sourdough starter, and a touch of sea salt. Perfect for sandwiches, toast, or enjoyed on its own with butter.',
    createdAt: '2024-01-14T08:00:00Z'
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
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
    description: 'Pure, unfiltered honey harvested from our local beehives. This golden honey has a rich, complex flavor that reflects the diverse wildflowers in our area. Great for tea, baking, or drizzling over yogurt and toast.',
    createdAt: '2024-01-13T15:45:00Z'
  },
];

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Find product by ID
    const foundProduct = mockProducts.find(p => p.id === parseInt(id as string));
    setProduct(foundProduct || null);
  }, [id]);

  const handleMessageSeller = () => {
    if (product) {
      router.push(`/chat/${product.sellerId}` as any);
    }
  };

  const handleShare = async () => {
    if (product) {
      try {
        await Share.share({
          message: `Check out this ${product.name} for $${product.price} on Marketplace!`,
          title: product.name,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleAddToCart = () => {
    Alert.alert(
      'Add to Cart',
      `Add ${quantity} ${product?.name} to your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add to Cart', 
          onPress: () => {
            Alert.alert('Success', 'Item added to cart!');
          }
        },
      ]
    );
  };

  const handleBuyNow = () => {
    Alert.alert(
      'Buy Now',
      `Purchase ${quantity} ${product?.name} for $${((product?.price || 0) * quantity).toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Buy Now', 
          onPress: () => {
            Alert.alert('Success', 'Purchase initiated! You will be redirected to payment.');
          }
        },
      ]
    );
  };

  const increaseQuantity = () => {
    if (product && quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

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

  const isOwnProduct = user?.id === product.sellerId;
  const totalPrice = product.price * quantity;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>📤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <View style={styles.header}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          </View>

          <View style={styles.availability}>
            <Text style={styles.availabilityText}>
              {product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
          </View>

          <View style={styles.sellerInfo}>
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerLabel}>Sold by</Text>
              <Text style={styles.sellerName}>{product.sellerName}</Text>
              {product.shopName && (
                <Text style={styles.shopName}>🏪 {product.shopName}</Text>
              )}
            </View>
            {!isOwnProduct && user?.type === 'buyer' && (
              <TouchableOpacity style={styles.messageButton} onPress={handleMessageSeller}>
                <Text style={styles.messageButtonText}>💬 Message</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {!isOwnProduct && user?.type === 'buyer' && product.quantity > 0 && (
            <View style={styles.purchaseSection}>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Quantity:</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                    onPress={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity 
                    style={[styles.quantityButton, quantity >= product.quantity && styles.quantityButtonDisabled]}
                    onPress={increaseQuantity}
                    disabled={quantity >= product.quantity}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {!isOwnProduct && user?.type === 'buyer' && product.quantity > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {isOwnProduct && (
        <View style={styles.footer}>
          <View style={styles.ownProductNotice}>
            <Text style={styles.ownProductText}>This is your product</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingBottom: 100,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 18,
  },
  productInfo: {
    backgroundColor: '#ffffff',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
  },
  header: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  availability: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  availabilityText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  sellerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  shopName: {
    fontSize: 14,
    color: '#3b82f6',
  },
  messageButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  messageButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  purchaseSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    backgroundColor: '#3b82f6',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  quantityButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    minWidth: 30,
    textAlign: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 20,
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  ownProductNotice: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ownProductText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});