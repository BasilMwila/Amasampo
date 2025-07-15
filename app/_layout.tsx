 
// File: app/_layout.tsx - Updated with Cart Context
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { createContext, useContext, useEffect, useState } from 'react';
import { CartProvider } from './contexts/CartContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Auth Context
interface User {
  id: number;
  name: string;
  email: string;
  type: 'buyer' | 'seller';
  shopName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock users for demo
  const mockUsers = [
    { id: 1, name: 'John Smith', email: 'john@email.com', type: 'seller' as const, shopName: 'Smith Farm Market' },
    { id: 2, name: 'Mary Johnson', email: 'mary@email.com', type: 'seller' as const, shopName: "Mary's Bakery" },
    { id: 3, name: 'Bob Wilson', email: 'bob@email.com', type: 'buyer' as const },
  ];

  useEffect(() => {
    // Check for stored authentication
    // In a real app, you'd check AsyncStorage or secure storage here
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const foundUser = mockUsers.find(u => u.email === email);
      if (foundUser) {
        setUser(foundUser);
        // In a real app, you'd store the auth token here
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: any) => {
    try {
      const newUser = {
        id: Date.now(),
        ...userData
      };
      setUser(newUser);
      // In a real app, you'd make an API call here
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    // In a real app, you'd clear the auth token here
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthRoute = segments[0] === 'auth';

    if (!user && !inAuthRoute) {
      // Redirect to login
      router.replace('/auth/login' as any);
    } else if (user && inAuthRoute) {
      // Redirect to app
      router.replace('/(tabs)' as any);
    }
  }, [user, segments, isLoading, router]);

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Product & Shopping */}
        <Stack.Screen name="product/[id]" options={{ title: 'Product Details' }} />
        <Stack.Screen name="cart/index" options={{ title: 'Shopping Cart' }} />
        <Stack.Screen name="checkout/index" options={{ title: 'Checkout' }} />
        <Stack.Screen name="search/index" options={{ title: 'Search' }} />
        
        {/* Orders & Reviews */}
        <Stack.Screen name="orders/index" options={{ title: 'Orders' }} />
        <Stack.Screen name="orders/[id]" options={{ title: 'Order Details' }} />
        <Stack.Screen name="reviews/[id]" options={{ title: 'Reviews' }} />
        
        {/* Communication */}
        <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
        <Stack.Screen name="notifications/index" options={{ title: 'Notifications' }} />
        
        {/* Seller Features */}
        <Stack.Screen name="dashboard/index" options={{ title: 'Dashboard' }} />
        <Stack.Screen name="products/manage" options={{ title: 'Manage Products' }} />
        
        {/* Account & Settings */}
        <Stack.Screen name="payment/methods" options={{ title: 'Payment Methods' }} />
        <Stack.Screen name="addresses/index" options={{ title: 'Addresses' }} />
        <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
        
        {/* Support & Legal */}
        <Stack.Screen name="help/index" options={{ title: 'Help & Support' }} />
        <Stack.Screen name="legal/index" options={{ title: 'Legal' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <RootLayoutNav />
      </CartProvider>
    </AuthProvider>
  );
}