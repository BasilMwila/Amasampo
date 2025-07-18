// File: app/(tabs)/_layout.tsx - Fixed version with consistent user type
import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useAuth } from '../_layout';

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: focused ? 22 : 20,
              color: color
            }}>🏠</Text>
          ),
          headerShown: false,
        }}
      />
      
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: focused ? 22 : 20,
              color: color
            }}>🔍</Text>
          ),
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: focused ? 22 : 20,
              color: color
            }}>🛒</Text>
          ),
          headerShown: false,
          tabBarBadge: user?.user_type === 'buyer' ? 3 : undefined,
          href: user?.user_type === 'buyer' ? '/(tabs)/cart' : null,
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: focused ? 22 : 20,
              color: color
            }}>💬</Text>
          ),
          headerShown: false,
          tabBarBadge: user?.user_type === 'seller' ? 2 : undefined,
        }}
      />

      <Tabs.Screen
        name="product"
        options={{
          title: 'Add Product',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: focused ? 22 : 20,
              color: color
            }}>➕</Text>
          ),
          headerShown: false,
          href: user?.user_type === 'seller' ? '/(tabs)/product' : null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: focused ? 22 : 20,
              color: color
            }}>👤</Text>
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}