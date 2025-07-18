
// app/_layout.tsx - Updated with real API integration
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { apiService, type User } from './services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  user_type: 'buyer' | 'seller';
  shop_name?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('auth_token');
      
      if (token) {
        try {
          const response = await apiService.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          console.error('Error fetching current user:', error);
          // Token might be expired, try to refresh
          try {
            await apiService.refreshToken();
            const response = await apiService.getCurrentUser();
            setUser(response.user);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear invalid tokens
            await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiService.login(email, password);
      setUser(response.user);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.message) {
        if (error.message.includes('Invalid email or password')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('Account is deactivated')) {
          errorMessage = 'Your account has been deactivated. Please contact support.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      Alert.alert('Login Failed', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiService.register(userData);
      setUser(response.user);
      return true;
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.message) {
        if (error.message.includes('already exists')) {
          errorMessage = 'An account with this email already exists.';
        } else if (error.message.includes('Validation')) {
          errorMessage = 'Please check your information and try again.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      Alert.alert('Registration Failed', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const authValue: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    updateUser,
  };

  // Show loading screen while initializing
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          // User is authenticated
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="products/[id]" 
              options={{ 
                headerShown: true,
                title: 'Product Details',
                headerBackTitle: 'Back'
              }} 
            />
            <Stack.Screen 
              name="chat/[userId]" 
              options={{ 
                headerShown: true,
                title: 'Chat',
                headerBackTitle: 'Back'
              }} 
            />
            <Stack.Screen 
              name="checkout" 
              options={{ 
                headerShown: true,
                title: 'Checkout',
                headerBackTitle: 'Cart'
              }} 
            />
            <Stack.Screen 
              name="orders" 
              options={{ 
                headerShown: true,
                title: 'Orders',
                headerBackTitle: 'Back'
              }} 
            />
            <Stack.Screen 
              name="notifications" 
              options={{ 
                headerShown: true,
                title: 'Notifications',
                headerBackTitle: 'Back'
              }} 
            />
            <Stack.Screen 
              name="settings" 
              options={{ 
                headerShown: true,
                title: 'Settings',
                headerBackTitle: 'Profile'
              }} 
            />
            <Stack.Screen 
              name="addresses" 
              options={{ 
                headerShown: true,
                title: 'Addresses',
                headerBackTitle: 'Profile'
              }} 
            />
            <Stack.Screen 
              name="payment/methods" 
              options={{ 
                headerShown: true,
                title: 'Payment Methods',
                headerBackTitle: 'Profile'
              }} 
            />
            <Stack.Screen 
              name="dashboard" 
              options={{ 
                headerShown: true,
                title: 'Dashboard',
                headerBackTitle: 'Profile'
              }} 
            />
            <Stack.Screen 
              name="products/manage" 
              options={{ 
                headerShown: true,
                title: 'Manage Products',
                headerBackTitle: 'Profile'
              }} 
            />
            <Stack.Screen 
              name="reviews/all" 
              options={{ 
                headerShown: true,
                title: 'Reviews',
                headerBackTitle: 'Profile'
              }} 
            />
            <Stack.Screen 
              name="help" 
              options={{ 
                headerShown: true,
                title: 'Help & Support',
                headerBackTitle: 'Profile'
              }} 
            />
            <Stack.Screen 
              name="legal" 
              options={{ 
                headerShown: true,
                title: 'Terms & Privacy',
                headerBackTitle: 'Profile'
              }} 
            />
            <Stack.Screen 
              name="about" 
              options={{ 
                headerShown: true,
                title: 'About',
                headerBackTitle: 'Profile'
              }} 
            />
          </>
        ) : (
          // User is not authenticated
          <>
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
            <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
          </>
        )}
      </Stack>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});