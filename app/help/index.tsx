 
// File: app/help/index.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../_layout';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  popular: boolean;
}

interface SupportCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  route?: string;
}

const mockFAQs: FAQItem[] = [
  {
    id: 1,
    question: 'How do I place an order?',
    answer: 'To place an order, browse products, add items to your cart, and proceed to checkout. You can pay using various payment methods including credit cards and bank transfers.',
    category: 'ordering',
    popular: true,
  },
  {
    id: 2,
    question: 'How do I contact a seller?',
    answer: 'You can message sellers directly through the app. Go to any product page and tap "Message Seller" to start a conversation.',
    category: 'communication',
    popular: true,
  },
  {
    id: 3,
    question: 'What payment methods are accepted?',
    answer: 'We accept major credit cards (Visa, Mastercard, American Express), bank transfers, and PayPal. You can manage your payment methods in Settings.',
    category: 'payment',
    popular: true,
  },
  {
    id: 4,
    question: 'How do I track my order?',
    answer: 'You can track your order status in the Orders section. You\'ll receive notifications for each status update, and you can view detailed tracking information.',
    category: 'ordering',
    popular: false,
  },
  {
    id: 5,
    question: 'How do I become a seller?',
    answer: 'To become a seller, create an account and select "Seller" during registration. You can then add products to your catalog and start selling to local buyers.',
    category: 'selling',
    popular: true,
  },
  {
    id: 6,
    question: 'What are the seller fees?',
    answer: 'We charge a small service fee of 3% on each successful transaction. There are no listing fees or monthly charges.',
    category: 'selling',
    popular: false,
  },
  {
    id: 7,
    question: 'How do I cancel an order?',
    answer: 'You can cancel an order before it\'s been prepared by the seller. Go to your order details and tap "Cancel Order". Refunds are processed within 3-5 business days.',
    category: 'ordering',
    popular: false,
  },
  {
    id: 8,
    question: 'How do I leave a review?',
    answer: 'After receiving your order, you can leave a review by going to your order history and tapping "Leave Review" on the completed order.',
    category: 'reviews',
    popular: false,
  },
];

const supportCategories: SupportCategory[] = [
  {
    id: 'account',
    title: 'Account & Profile',
    icon: '👤',
    description: 'Manage your account settings and profile information',
  },
  {
    id: 'ordering',
    title: 'Orders & Payments',
    icon: '🛒',
    description: 'Help with placing orders, payments, and order tracking',
  },
  {
    id: 'selling',
    title: 'Selling on Marketplace',
    icon: '🏪',
    description: 'Guide for sellers: listing products, managing orders',
  },
  {
    id: 'technical',
    title: 'Technical Issues',
    icon: '⚙️',
    description: 'App problems, bugs, and technical difficulties',
  },
  {
    id: 'safety',
    title: 'Safety & Security',
    icon: '🛡️',
    description: 'Report issues, fraud prevention, and safety guidelines',
  },
  {
    id: 'contact',
    title: 'Contact Support',
    icon: '📞',
    description: 'Get in touch with our support team',
    route: '/help/contact',
  },
];

export default function HelpSupportScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const popularFAQs = mockFAQs.filter(faq => faq.popular);

  const handleCategoryPress = (categoryId: string) => {
    const category = supportCategories.find(c => c.id === categoryId);
    if (category?.route) {
      router.push(category.route as any);
    } else {
      setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    }
  };

  const handleFAQPress = (faqId: number) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact us?',
      [
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@marketplace.com') },
        { text: 'Phone', onPress: () => Linking.openURL('tel:+1234567890') },
        { text: 'Live Chat', onPress: () => Alert.alert('Coming Soon', 'Live chat will be available soon!') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const CategoryCard = ({ category }: { category: SupportCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === category.id && styles.categoryCardSelected,
      ]}
      onPress={() => handleCategoryPress(category.id)}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={styles.categoryTitle}>{category.title}</Text>
      <Text style={styles.categoryDescription}>{category.description}</Text>
    </TouchableOpacity>
  );

  const FAQCard = ({ faq }: { faq: FAQItem }) => (
    <TouchableOpacity
      style={styles.faqCard}
      onPress={() => handleFAQPress(faq.id)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Text style={styles.faqToggle}>
          {expandedFAQ === faq.id ? '−' : '+'}
        </Text>
      </View>
      {expandedFAQ === faq.id && (
        <Text style={styles.faqAnswer}>{faq.answer}</Text>
      )}
      {faq.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Popular</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <TouchableOpacity onPress={handleContactSupport}>
          <Text style={styles.contactButton}>📞</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <Text style={styles.welcomeText}>Hi {user?.name}! 👋</Text>
          <Text style={styles.helpText}>How can we help you today?</Text>
          
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help topics..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/orders' as any)}
          >
            <Text style={styles.quickActionIcon}>📦</Text>
            <Text style={styles.quickActionText}>My Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleContactSupport}
          >
            <Text style={styles.quickActionIcon}>💬</Text>
            <Text style={styles.quickActionText}>Contact Us</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/help/report' as any)}
          >
            <Text style={styles.quickActionIcon}>⚠️</Text>
            <Text style={styles.quickActionText}>Report Issue</Text>
          </TouchableOpacity>
        </View>

        {/* Support Categories */}
        {!searchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            <View style={styles.categoriesGrid}>
              {supportCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </View>
          </View>
        )}

        {/* Popular FAQs or Search Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Search Results (${filteredFAQs.length})` : 'Popular Questions'}
          </Text>
          
          {(searchQuery ? filteredFAQs : popularFAQs).map((faq) => (
            <FAQCard key={faq.id} faq={faq} />
          ))}
          
          {filteredFAQs.length === 0 && searchQuery && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubtext}>
                Try different keywords or contact support for help
              </Text>
            </View>
          )}
        </View>

        {/* Still Need Help */}
        <View style={styles.section}>
          <View style={styles.stillNeedHelp}>
            <Text style={styles.stillNeedHelpTitle}>Still need help?</Text>
            <Text style={styles.stillNeedHelpSubtext}>
              Our support team is here to help you with any questions
            </Text>
            
            <View style={styles.contactOptions}>
              <TouchableOpacity
                style={styles.contactOption}
                onPress={() => Linking.openURL('mailto:support@marketplace.com')}
              >
                <Text style={styles.contactOptionIcon}>📧</Text>
                <View style={styles.contactOptionText}>
                  <Text style={styles.contactOptionTitle}>Email Support</Text>
                  <Text style={styles.contactOptionSubtitle}>We&apos;ll respond within 24 hours</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.contactOption}
                onPress={() => Linking.openURL('tel:+1234567890')}
              >
                <Text style={styles.contactOptionIcon}>📞</Text>
                <View style={styles.contactOptionText}>
                  <Text style={styles.contactOptionTitle}>Phone Support</Text>
                  <Text style={styles.contactOptionSubtitle}>Mon-Fri, 9AM-6PM EST</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Marketplace v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>© 2024 Marketplace. All rights reserved.</Text>
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
  contactButton: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6b7280',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  clearSearch: {
    fontSize: 16,
    color: '#6b7280',
    padding: 4,
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryCardSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#3b82f6',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  faqCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    position: 'relative',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  faqToggle: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#374151',
    marginTop: 12,
    lineHeight: 20,
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  stillNeedHelp: {
    alignItems: 'center',
  },
  stillNeedHelpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  stillNeedHelpSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  contactOptions: {
    width: '100%',
    gap: 12,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contactOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  contactOptionText: {
    flex: 1,
  },
  contactOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  contactOptionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appInfoText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
});