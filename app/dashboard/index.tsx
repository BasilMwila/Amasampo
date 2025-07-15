// File: app/dashboard/index.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../_layout';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  avgOrderValue: number;
  pendingOrders: number;
  completedToday: number;
}

interface TopProduct {
  id: number;
  name: string;
  category: string;
  soldQuantity: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
}

interface RecentActivity {
  id: number;
  type: 'order' | 'product_added' | 'review' | 'message';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
}

const mockStats: DashboardStats = {
  totalRevenue: 1247.80,
  totalOrders: 89,
  activeProducts: 12,
  avgOrderValue: 14.02,
  pendingOrders: 3,
  completedToday: 5,
};

const mockTopProducts: TopProduct[] = [
  {
    id: 1,
    name: 'Organic Apples',
    category: 'Fruits',
    soldQuantity: 45,
    revenue: 134.55,
    trend: 'up',
  },
  {
    id: 2,
    name: 'Local Honey',
    category: 'Pantry',
    soldQuantity: 23,
    revenue: 206.77,
    trend: 'up',
  },
  {
    id: 3,
    name: 'Fresh Bread',
    category: 'Bakery',
    soldQuantity: 67,
    revenue: 234.50,
    trend: 'stable',
  },
];

const mockRecentActivity: RecentActivity[] = [
  {
    id: 1,
    type: 'order',
    title: 'New Order #1005',
    description: 'Bob Wilson ordered 3x Organic Apples',
    timestamp: '2 hours ago',
    amount: 8.97,
  },
  {
    id: 2,
    type: 'message',
    title: 'New Message',
    description: 'Alice Brown asked about honey availability',
    timestamp: '4 hours ago',
  },
  {
    id: 3,
    type: 'order',
    title: 'Order Completed',
    description: 'Order #1004 marked as delivered',
    timestamp: '6 hours ago',
    amount: 15.50,
  },
  {
    id: 4,
    type: 'review',
    title: 'New Review',
    description: 'Mary rated your Fresh Bread ⭐⭐⭐⭐⭐',
    timestamp: '1 day ago',
  },
];

export default function SellerDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const router = useRouter();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return '📦';
      case 'product_added': return '➕';
      case 'review': return '⭐';
      case 'message': return '💬';
      default: return '📱';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const StatCard = ({ title, value, subtitle, color = '#3b82f6' }: {
    title: string;
    value: string;
    subtitle?: string;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const TopProductItem = ({ product }: { product: TopProduct }) => (
    <View style={styles.topProductItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
      </View>
      <View style={styles.productStats}>
        <Text style={styles.productQuantity}>{product.soldQuantity} sold</Text>
        <Text style={styles.productRevenue}>${product.revenue.toFixed(2)}</Text>
      </View>
      <Text style={styles.trendIcon}>{getTrendIcon(product.trend)}</Text>
    </View>
  );

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Text style={styles.activityIconText}>{getActivityIcon(activity.type)}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityDescription}>{activity.description}</Text>
        <Text style={styles.activityTimestamp}>{activity.timestamp}</Text>
      </View>
      {activity.amount && (
        <Text style={styles.activityAmount}>+${activity.amount}</Text>
      )}
    </View>
  );

  if (user?.type !== 'seller') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Dashboard is only available for sellers</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={() => router.push('/dashboard/analytics' as any)}>
          <Text style={styles.analyticsButton}>📊</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back, {user.name}! 👋</Text>
          <Text style={styles.shopName}>{user.shopName}</Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {['7d', '30d', '90d'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range as any)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Revenue"
            value={`$${mockStats.totalRevenue.toLocaleString()}`}
            subtitle={`from ${mockStats.totalOrders} orders`}
            color="#10b981"
          />
          <StatCard
            title="Active Products"
            value={mockStats.activeProducts.toString()}
            subtitle="listed in catalog"
          />
          <StatCard
            title="Avg Order Value"
            value={`$${mockStats.avgOrderValue}`}
            color="#8b5cf6"
          />
          <StatCard
            title="Pending Orders"
            value={mockStats.pendingOrders.toString()}
            subtitle="need attention"
            color="#f59e0b"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/product' as any)}
            >
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionText}>Add Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/orders' as any)}
            >
              <Text style={styles.actionIcon}>📦</Text>
              <Text style={styles.actionText}>View Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/products/manage' as any)}
            >
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionText}>Manage Products</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/messages' as any)}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          <View style={styles.topProductsList}>
            {mockTopProducts.map((product) => (
              <TopProductItem key={product.id} product={product} />
            ))}
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Products →</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {mockRecentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Activity →</Text>
          </TouchableOpacity>
        </View>

        {/* Performance Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>💡</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Great Performance!</Text>
              <Text style={styles.insightText}>
                Your average response time to messages is 15 minutes. Customers love quick responses!
              </Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>📈</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Sales Trending Up</Text>
              <Text style={styles.insightText}>
                Your sales have increased by 23% compared to last month. Keep up the great work!
              </Text>
            </View>
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
  backButton: {
    fontSize: 16,
    color: '#3b82f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  analyticsButton: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  timeRangeTextActive: {
    color: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  topProductsList: {
    gap: 12,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  productStats: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  productQuantity: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  trendIcon: {
    fontSize: 18,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  activityTimestamp: {
    fontSize: 11,
    color: '#9ca3af',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  viewAllButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
});