// File: app/(tabs)/profile.tsx - Updated with all features
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

  const menuItems = [
    // Account & Orders
    {
      section: 'Account & Orders',
      items: [
        ...(user?.type === 'buyer' ? [
          { icon: '📦', title: 'My Orders', subtitle: 'Track your purchases', route: '/orders' },
          { icon: '📍', title: 'Delivery Addresses', subtitle: 'Manage delivery locations', route: '/addresses' },
        ] : []),
        ...(user?.type === 'seller' ? [
          { icon: '📊', title: 'Dashboard', subtitle: 'Sales overview & analytics', route: '/dashboard' },
          { icon: '📦', title: 'Sales Orders', subtitle: 'Manage customer orders', route: '/orders' },
          { icon: '📝', title: 'Manage Products', subtitle: 'Edit your product catalog', route: '/products/manage' },
        ] : []),
        { icon: '💳', title: 'Payment Methods', subtitle: 'Manage your payment options', route: '/payment/methods' },
      ]
    },
    // Communication
    {
      section: 'Communication',
      items: [
        { icon: '💬', title: 'Messages', subtitle: 'Chat with buyers/sellers', route: '/(tabs)/messages' },
        { icon: '🔔', title: 'Notifications', subtitle: 'Manage your alerts', route: '/notifications' },
        { icon: '⭐', title: 'Reviews', subtitle: 'View reviews and ratings', route: '/reviews/all' },
      ]
    },
    // Settings & Support
    {
      section: 'Settings & Support',
      items: [
        { icon: '⚙️', title: 'Settings', subtitle: 'App preferences', route: '/settings' },
        { icon: '❓', title: 'Help & Support', subtitle: 'Get help and support', route: '/help' },
        { icon: '📄', title: 'Terms & Privacy', subtitle: 'Legal information', route: '/legal' },
        { icon: 'ℹ️', title: 'About', subtitle: 'App information', route: '/about' },
      ]
    }
  ];

  const handleMenuPress = (route: string) => {
    router.push(route as any);
  };

  const MenuSection = ({ section }: { section: typeof menuItems[0] }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.section}</Text>
      {section.items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => handleMenuPress(item.route)}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => router.push('/notifications' as any)}>
          <View style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.userSection}>
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

          {/* Quick Stats for Sellers */}
          {user?.type === 'seller' && (
            <View style={styles.quickStats}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push('/dashboard' as any)}
              >
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Products</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push('/orders' as any)}
              >
                <Text style={styles.statNumber}>89</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push('/reviews/all' as any)}
              >
                <Text style={styles.statNumber}>4.8⭐</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Stats for Buyers */}
          {user?.type === 'buyer' && (
            <View style={styles.quickStats}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push('/orders' as any)}
              >
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push('/(tabs)/cart' as any)}
              >
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>In Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push('/addresses' as any)}
              >
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Addresses</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, index) => (
          <MenuSection key={index} section={section} />
        ))}

        {/* App Version & Logout */}
        <View style={styles.footerSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          
          <View style={styles.appVersion}>
            <Text style={styles.appVersionText}>Marketplace v1.0.0</Text>
            <Text style={styles.appVersionSubtext}>Made with ❤️ for local communities</Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  notificationButton: {
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  userSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  footerSection: {
    margin: 16,
    marginTop: 0,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  appVersion: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appVersionText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  appVersionSubtext: {
    fontSize: 11,
    color: '#9ca3af',
  },
});