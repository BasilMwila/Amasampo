/* eslint-disable react/no-unescaped-entities */
// File: app/about/index.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🛍️</Text>
            <Text style={styles.appName}>Marketplace</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Marketplace is a local community platform that connects buyers and sellers in your area. 
              Whether you're looking to buy fresh produce, handmade crafts, or local services, 
              or wanting to sell your own products, our platform makes it easy and secure.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🛒</Text>
              <Text style={styles.featureText}>Easy buying and selling</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💬</Text>
              <Text style={styles.featureText}>Direct messaging with sellers</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureText}>Secure payment processing</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📍</Text>
              <Text style={styles.featureText}>Location-based discovery</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⭐</Text>
              <Text style={styles.featureText}>Reviews and ratings</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureText}>Mobile-first design</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            To strengthen local communities by providing a platform that makes it easy for neighbors to 
            buy and sell goods and services. We believe in supporting local economies and fostering 
            connections between people in the same community.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📧</Text>
              <Text style={styles.contactText}>support@marketplace.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText}>+1 (555) 123-4567</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>🌐</Text>
              <Text style={styles.contactText}>www.marketplace.com</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity 
              style={styles.legalLink}
              onPress={() => router.push('/legal' as any)}
            >
              <Text style={styles.legalLinkText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.legalLink}
              onPress={() => router.push('/legal' as any)}
            >
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Marketplace. All rights reserved.
          </Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ for local communities
          </Text>
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
  spacer: {
    width: 60,
  },
  content: {
    flex: 1,
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 64,
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  version: {
    fontSize: 16,
    color: '#6b7280',
  },
  descriptionContainer: {
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
  missionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
  },
  legalLinks: {
    gap: 8,
  },
  legalLink: {
    paddingVertical: 8,
  },
  legalLinkText: {
    fontSize: 16,
    color: '#3b82f6',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});