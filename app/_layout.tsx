// app/_layout.tsx - Complete updated layout with proper logout handling
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { apiService, type User } from './services/api';
import { socketService } from './services/socketService';
import { notificationService } from './services/notificationService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
  checkAuthStatus: () => Promise<boolean>;
  refreshAuth: () => Promise<void>;
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

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setInitializing(true);
      await checkAuthStatus();
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setInitializing(false);
    }
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Try to get current user info to validate token
          const response = await apiService.getCurrentUser();
          setUser(response.user);
          
          // Update stored user data if different
          await AsyncStorage.setItem('user', JSON.stringify(response.user));
          
          // Initialize push notifications for authenticated user
          try {
            await notificationService.initialize();
          } catch (error) {
            console.warn('⚠️ Failed to initialize push notifications:', error);
          }
          
          console.log('✅ Auth status: Authenticated');
          return true;
        } catch (error: any) {
          console.warn('Token validation failed:', error.message);
          
          // Try to refresh token
          try {
            console.log('🔄 Attempting token refresh...');
            await apiService.refreshToken();
            
            // Try getting user again with new token
            const response = await apiService.getCurrentUser();
            setUser(response.user);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
            
            // Initialize push notifications after token refresh
            try {
              await notificationService.initialize();
            } catch (error) {
              console.warn('⚠️ Failed to initialize push notifications after token refresh:', error);
            }
            
            console.log('✅ Token refreshed successfully');
            return true;
          } catch (refreshError: any) {
            console.warn('Token refresh failed:', refreshError.message);
            
            // Clear invalid tokens and user data
            await clearAuthData();
            return false;
          }
        }
      } else {
        console.log('ℹ️ No stored auth data found');
        await clearAuthData();
        return false;
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      await clearAuthData();
      return false;
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user']);
      setUser(null);
      console.log('🗑️ Auth data cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔄 Attempting login...');
      
      const response = await apiService.login(email, password);
      
      if (response.user && response.tokens) {
        setUser(response.user);
        
        // Store user data explicitly (apiService already stores tokens)
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        
        // Connect to real-time messaging
        try {
          const socketConnected = await socketService.connect();
          console.log(socketConnected ? '✅ Socket connected' : '⚠️ Socket connection failed');
        } catch (socketError) {
          console.warn('⚠️ Socket connection failed:', socketError);
          // Don't fail login if socket connection fails
        }
        
        // Initialize push notifications
        try {
          const notificationsEnabled = await notificationService.initialize();
          console.log(notificationsEnabled ? '✅ Notifications initialized' : '⚠️ Notifications not available');
        } catch (notificationError) {
          console.warn('⚠️ Notification initialization failed:', notificationError);
          // Don't fail login if notification setup fails
        }
        
        console.log('✅ Login successful');
        return true;
      } else {
        console.error('❌ Login failed: Invalid response format');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error.message);
      
      // Provide user-friendly error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Invalid email or password') || 
            error.message.includes('INVALID_CREDENTIALS')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('Account is deactivated') || 
                   error.message.includes('ACCOUNT_DEACTIVATED')) {
          errorMessage = 'Your account has been deactivated. Please contact support.';
        } else if (error.message.includes('Network') || 
                   error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Too many')) {
          errorMessage = 'Too many login attempts. Please try again later.';
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
      console.log('🔄 Attempting registration...');
      
      const response = await apiService.register(userData);
      
      if (response.user && response.tokens) {
        setUser(response.user);
        
        // Store user data explicitly (apiService already stores tokens)
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        
        // Connect to real-time messaging
        try {
          const socketConnected = await socketService.connect();
          console.log(socketConnected ? '✅ Socket connected' : '⚠️ Socket connection failed');
        } catch (socketError) {
          console.warn('⚠️ Socket connection failed:', socketError);
          // Don't fail registration if socket connection fails
        }
        
        // Initialize push notifications
        try {
          const notificationsEnabled = await notificationService.initialize();
          console.log(notificationsEnabled ? '✅ Notifications initialized' : '⚠️ Notifications not available');
        } catch (notificationError) {
          console.warn('⚠️ Notification initialization failed:', notificationError);
          // Don't fail registration if notification setup fails
        }
        
        console.log('✅ Registration successful');
        return true;
      } else {
        console.error('❌ Registration failed: Invalid response format');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Registration failed:', error.message);
      
      // Provide user-friendly error messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message) {
        if (error.message.includes('already exists') || 
            error.message.includes('EMAIL_ALREADY_EXISTS')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (error.message.includes('Validation') || 
                   error.message.includes('VALIDATION_ERROR')) {
          errorMessage = 'Please check your information and try again.';
        } else if (error.message.includes('Network') || 
                   error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Password must be at least 8 characters with letters and numbers.';
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
      console.log('🔄 Starting logout process...');
      
      // Call logout API to blacklist tokens on server
      try {
        await apiService.logout();
        console.log('✅ Server logout successful');
      } catch (logoutError: any) {
        console.warn('⚠️ Server logout failed (continuing with local cleanup):', logoutError.message);
        // Continue with local cleanup even if server call fails
      }
      
      // Disconnect from real-time messaging
      try {
        socketService.disconnect();
        console.log('✅ Socket disconnected');
      } catch (socketError) {
        console.warn('⚠️ Socket disconnect failed:', socketError);
      }
      
      // Clear local state and storage
      await clearAuthData();
      
      console.log('✅ Logout completed successfully');
      
    } catch (error: any) {
      console.error('❌ Logout error:', error.message);
      
      // Even if there's an error, still clear local data
      await clearAuthData();
      
      console.log('⚠️ Logout completed with errors (local cleanup successful)');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update stored user data
      AsyncStorage.setItem('user', JSON.stringify(updatedUser)).catch(error => {
        console.error('Error updating stored user data:', error);
      });
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      await checkAuthStatus();
    } catch (error) {
      console.error('Auth refresh failed:', error);
    } finally {
      setLoading(false);
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
    checkAuthStatus,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Simulate minimal initialization time
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while initializing
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <>
        <AuthScreens />
        <StatusBar style="auto" />
      </>
    </AuthProvider>
  );
}

function AuthScreens() {
  const { user, isAuthenticated } = useAuth();

  // Handle navigation when auth state changes
  useEffect(() => {
    if (!isAuthenticated && !user) {
      console.log('🔄 User logged out, navigating to auth screen...');
      // Use a small delay to ensure state has fully updated
      setTimeout(() => {
        router.replace('/auth/welcome');
      }, 100);
    }
  }, [isAuthenticated, user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated && user ? (
        // User is authenticated - show app screens
        <>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="products/[id]" 
            options={{ 
              headerShown: true,
              title: 'Product Details',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="chat/[userId]" 
            options={{ 
              headerShown: true,
              title: 'Chat',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="checkout" 
            options={{ 
              headerShown: true,
              title: 'Checkout',
              headerBackTitle: 'Cart',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="orders" 
            options={{ 
              headerShown: true,
              title: 'My Orders',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="notifications" 
            options={{ 
              headerShown: true,
              title: 'Notifications',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="settings" 
            options={{ 
              headerShown: true,
              title: 'Settings',
              headerBackTitle: 'Profile',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="addresses" 
            options={{ 
              headerShown: true,
              title: 'My Addresses',
              headerBackTitle: 'Profile',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="payment/methods" 
            options={{ 
              headerShown: true,
              title: 'Payment Methods',
              headerBackTitle: 'Profile',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="dashboard" 
            options={{ 
              headerShown: true,
              title: 'Seller Dashboard',
              headerBackTitle: 'Profile',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="products/manage" 
            options={{ 
              headerShown: true,
              title: 'Manage Products',
              headerBackTitle: 'Dashboard',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="reviews/all" 
            options={{ 
              headerShown: true,
              title: 'My Reviews',
              headerBackTitle: 'Profile',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="help" 
            options={{ 
              headerShown: true,
              title: 'Help & Support',
              headerBackTitle: 'Profile',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="legal" 
            options={{ 
              headerShown: true,
              title: 'Terms & Privacy',
              headerBackTitle: 'Profile',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="about" 
            options={{ 
              headerShown: true,
              title: 'About Marketplace',
              headerBackTitle: 'Profile',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="profile/edit" 
            options={{ 
              headerShown: true,
              title: 'Edit Profile',
              headerBackTitle: 'Profile',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
          <Stack.Screen 
            name="search" 
            options={{ 
              headerShown: true,
              title: 'Search',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
        </>
      ) : (
        // User is not authenticated - show auth screens
        <>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen 
            name="auth/forgot-password" 
            options={{ 
              headerShown: true,
              title: 'Reset Password',
              headerBackTitle: 'Login',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTintColor: '#1a1a1a',
            }} 
          />
        </>
      )}
    </Stack>
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