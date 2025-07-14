
// File: app/(tabs)/profile.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../_layout';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  const handlePaymentMethods = () => {
    router.push('/payment/methods');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info Section */}
        <View style={styles.section}>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.userTypeBadge}>
                <Text style={styles.userTypeText}>
                  {user?.type === 'seller' ? '🏪 Seller' : '🛒 Buyer'}
                </Text>
              </View>
              {user?.shopName && (
                <Text style={styles.shopName}>Shop: {user.shopName}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handlePaymentMethods}>
            <Text style={styles.settingIcon}>💳</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Payment Methods</Text>
              <Text style={styles.settingSubtitle}>Manage your payment options</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingSubtitle}>Manage your alerts</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔒</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy & Security</Text>
              <Text style={styles.settingSubtitle}>Account security settings</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>❓</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help Center</Text>
              <Text style={styles.settingSubtitle}>Get help and support</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>📝</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Terms & Conditions</Text>
              <Text style={styles.settingSubtitle}>Legal information</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🛡️</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy Policy</Text>
              <Text style={styles.settingSubtitle}>How we handle your data</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Marketplace v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  userTypeBadge: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  userTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  shopName: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});