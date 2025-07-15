// File: contexts/CartContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  sellerId: number;
  sellerName: string;
  image: string;
  maxQuantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getCartItemCount: (productId: number) => number;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Initialize with some mock data for demo
  useEffect(() => {
    const mockCartItems: CartItem[] = [
      {
        id: 1,
        productId: 1,
        name: 'Organic Apples',
        price: 2.99,
        quantity: 3,
        sellerId: 1,
        sellerName: 'John Smith',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop',
        maxQuantity: 50,
      },
      {
        id: 2,
        productId: 2,
        name: 'Fresh Bread',
        price: 3.50,
        quantity: 2,
        sellerId: 2,
        sellerName: 'Mary Johnson',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop',
        maxQuantity: 20,
      },
      {
        id: 3,
        productId: 3,
        name: 'Local Honey',
        price: 8.99,
        quantity: 1,
        sellerId: 1,
        sellerName: 'John Smith',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=200&fit=crop',
        maxQuantity: 15,
      },
    ];
    setItems(mockCartItems);
  }, []);

  const addToCart = (product: Omit<CartItem, 'id'>) => {
    setItems(currentItems => {
      // Check if product already exists in cart
      const existingItem = currentItems.find(item => item.productId === product.productId);
      
      if (existingItem) {
        // Update quantity if item already exists
        const newQuantity = existingItem.quantity + product.quantity;
        if (newQuantity > product.maxQuantity) {
          Alert.alert(
            'Quantity Limited',
            `Sorry, only ${product.maxQuantity} items available. You already have ${existingItem.quantity} in your cart.`
          );
          return currentItems;
        }
        
        return currentItems.map(item =>
          item.productId === product.productId
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          ...product,
          id: Date.now() + Math.random(), // Simple ID generation
        };
        return [...currentItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item => {
        if (item.id === itemId) {
          const validQuantity = Math.min(quantity, item.maxQuantity);
          return { ...item, quantity: validQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = (productId: number) => {
    const item = items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getCartItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook for easy cart management with toast notifications
export const useCartActions = () => {
  const cart = useCart();

  const addProductToCart = (product: {
    id: number;
    name: string;
    price: number;
    sellerId: number;
    sellerName: string;
    image: string;
    maxQuantity: number;
  }, quantity: number = 1) => {
    const cartItem: Omit<CartItem, 'id'> = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      image: product.image,
      maxQuantity: product.maxQuantity,
    };

    cart.addToCart(cartItem);
    
    Alert.alert(
      'Added to Cart',
      `${quantity} ${product.name} added to your cart`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => {
          // Navigation would be handled by the component using this hook
        }},
      ]
    );
  };

  return {
    ...cart,
    addProductToCart,
  };
};