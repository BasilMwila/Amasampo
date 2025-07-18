
// app/(tabs)/cart.tsx - Updated with real API integration
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../_layout';
import { COLORS, DEFAULT_IMAGES, ERROR_MESSAGES } from '../constants/constants';
import { apiService, type CartItem } from '../services/api';

interface CartSummary {
  total_items: number;
  subtotal: string;
  estimated_delivery_fee: number;
  estimated_service_fee: string;
  estimated_total: string;
}

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const { user } = useAuth();
  const router = useRouter();

  // Load cart data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCartData();
    }, [])
  );

  const loadCartData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiService.getCart();
      setCartItems(response.cart_items || []);
      setSummary(response.summary || null);
    } catch (error: any) {
      console.error('Failed to load cart:', error);
      Alert.alert('Error', error.message || ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    // Find the item to check max quantity
    const item = cartItems.find(item => item.product_id === productId);
    if (!item) return;

    if (newQuantity > item.available_quantity) {
      Alert.alert(
        'Quantity Limit',
        `Only ${item.available_quantity} items available`
      );
      return;
    }

    try {
      setUpdatingItems(prev => new Set(prev).add(productId));
      
      await apiService.updateCartItem(productId, newQuantity);
      
      // Update local state
      setCartItems(items =>
        items.map(item =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      // Recalculate summary
      loadCartData();
    } catch (error: any) {
      console.error('Failed to update cart item:', error);
      Alert.alert('Error', error.message || 'Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const removeItem = (productId: number) => {
    const item = cartItems.find(item => item.product_id === productId);
    if (!item) return;

    Alert.alert(
      'Remove Item',
      `Remove "${item.name}" from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdatingItems(prev => new Set(prev).add(productId));
              
              await apiService.removeFromCart(productId);
              
              // Update local state
              setCartItems(items => items.filter(item => item.product_id !== productId));
              
              // Recalculate summary
              loadCartData();
            } catch (error: any) {
              console.error('Failed to remove cart item:', error);
              Alert.alert('Error', error.message || 'Failed to remove item');
            } finally {
              setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const clearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiService.clearCart();
              setCartItems([]);
              setSummary(null);
            } catch (error: any) {
              console.error('Failed to clear cart:', error);
              Alert.alert('Error', error.message || 'Failed to clear cart');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Add items to your cart before checkout');
      return;
    }
    router.push('/checkout' as any);
  };

  const handleContinueShopping = () => {
    router.push('/(tabs)' as any);
  };

  const CartItemComponent = ({ item }: { item: CartItem }) => {
    const isUpdating = updatingItems.has(item.product_id);
    
    return (
      <View style={[styles.cartItem, isUpdating && styles.cartItemUpdating]}>
        <Image 
          source={{ uri: item.image_url || DEFAULT_IMAGES.PRODUCT_PLACEHOLDER }} 
          style={styles.itemImage}
          defaultSource={{ uri: DEFAULT_IMAGES.PRODUCT_PLACEHOLDER }}
        />
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          {item.seller_name && (
            <Text style={styles.sellerName}>by {item.seller_name}</Text>
          )}
          {item.shop_name && (
            <Text style={styles.shopName}>{item.shop_name}</Text>
          )}
          <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, isUpdating && styles.quantityButtonDisabled]}
              onPress={() => updateQuantity(item.product_id, item.quantity - 1)}
              disabled={isUpdating}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            
            <View style={styles.quantityTextContainer}>
              {isUpdating ? (
                <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              ) : (
                <Text style={styles.quantityText}>{item.quantity}</Text>
              )}
            </View>
            
            <TouchableOpacity
              style={[
                styles.quantityButton,
                (item.quantity >= item.available_quantity || isUpdating) && styles.quantityButtonDisabled
              ]}
              onPress={() => updateQuantity(item.product_id, item.quantity + 1)}
              disabled={item.quantity >= item.available_quantity || isUpdating}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          {item.quantity >= item.available_quantity && (
            <Text style={styles.maxQuantityText}>Maximum quantity reached</Text>
          )}
        </View>

        <View style={styles.itemActions}>
          <Text style={styles.itemTotal}>
            ${(item.price * item.quantity).toFixed(2)}
          </Text>
          <TouchableOpacity
            style={[styles.removeButton, isUpdating && styles.removeButtonDisabled]}
            onPress={() => removeItem(item.product_id)}
            disabled={isUpdating}
          >
            <Text style={styles.removeButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (user?.user_type !== 'buyer') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Cart is only available for buyers</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={styles.headerActions}>
          {cartItems.length > 0 && (
            <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtitle}>
            Discover amazing products from local sellers
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={handleContinueShopping}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.product_id.toString()}
            renderItem={({ item }) => <CartItemComponent item={item} />}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadCartData(true)}
                colors={[COLORS.PRIMARY]}
                tintColor={COLORS.PRIMARY}
              />
            }
          />

          {summary && (
            <View style={styles.footer}>
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal ({summary.total_items} items)</Text>
                  <Text style={styles.summaryValue}>${summary.subtotal}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  <Text style={styles.summaryValue}>${summary.estimated_delivery_fee.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Service Fee</Text>
                  <Text style={styles.summaryValue}>${summary.estimated_service_fee}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>${summary.estimated_total}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinueShopping}
                >
                  <Text style={styles.continueButtonText}>Continue Shopping</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={handleCheckout}
                >
                  <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.CARD,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.ERROR,
  },
  clearButtonText: {
    color: COLORS.CARD,
    fontSize: 12,
    fontWeight: '600',
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
  cartList: {
    padding: 16,
  },
  cartItem: {
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartItemUpdating: {
    opacity: 0.7,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: COLORS.BORDER,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  shopName: {
    fontSize: 11,
    color: COLORS.TEXT_MUTED,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '500',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  quantityTextContainer: {
    marginHorizontal: 16,
    minWidth: 30,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  maxQuantityText: {
    fontSize: 10,
    color: COLORS.WARNING,
    marginTop: 4,
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonDisabled: {
    opacity: 0.5,
  },
  removeButtonText: {
    fontSize: 18,
  },
  footer: {
    backgroundColor: COLORS.CARD,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    padding: 20,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  actionButtons: {
    gap: 12,
  },
  continueButton: {
    backgroundColor: COLORS.BACKGROUND,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  checkoutButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.CARD,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.CARD,
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
  },
});