// File: app/(tabs)/_layout.tsx - Updated with cart
import { Tabs } from 'expo-router';
import React from 'react';
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
            <span style={{ 
              fontSize: focused ? 22 : 20,
              transition: 'all 0.2s ease'
            }}>🏠</span>
          ),
          headerShown: false,
        }}
      />
      
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <span style={{ 
              fontSize: focused ? 22 : 20,
              transition: 'all 0.2s ease'
            }}>🔍</span>
          ),
          headerShown: false,
        }}
      />

      {user?.type === 'buyer' && (
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color, focused }) => (
              <span style={{ 
                fontSize: focused ? 22 : 20,
                transition: 'all 0.2s ease'
              }}>🛒</span>
            ),
            headerShown: false,
            tabBarBadge: 3, // Would be dynamic in real app
          }}
        />
      )}

      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <span style={{ 
              fontSize: focused ? 22 : 20,
              transition: 'all 0.2s ease'
            }}>💬</span>
          ),
          headerShown: false,
          tabBarBadge: user?.type === 'seller' ? 2 : undefined, // Would be dynamic
        }}
      />

      {user?.type === 'seller' && (
        <Tabs.Screen
          name="product"
          options={{
            title: 'Add Product',
            tabBarIcon: ({ color, focused }) => (
              <span style={{ 
                fontSize: focused ? 22 : 20,
                transition: 'all 0.2s ease'
              }}>➕</span>
            ),
            headerShown: false,
          }}
        />
      )}

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <span style={{ 
              fontSize: focused ? 22 : 20,
              transition: 'all 0.2s ease'
            }}>👤</span>
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}