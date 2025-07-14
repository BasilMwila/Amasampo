// File: app/(tabs)/_layout.tsx
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
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 20 }}>🏠</span>,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 20 }}>💬</span>,
          headerShown: false,
        }}
      />
      {user?.type === 'seller' && (
        <Tabs.Screen
          name="product"
          options={{
            title: 'Add Product',
            tabBarIcon: ({ color }) => <span style={{ fontSize: 20 }}>➕</span>,
            headerShown: false,
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 20 }}>👤</span>,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}