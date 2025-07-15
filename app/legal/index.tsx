// File: app/legal/index.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LegalSection {
  id: string;
  title: string;
  content: string;
}

const termsOfService: LegalSection[] = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing and using the Marketplace mobile application ("App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
  },
  {
    id: 'description',
    title: '2. Service Description',
    content: `Marketplace is a platform that connects local buyers and sellers. We provide a marketplace where users can list products, make purchases, communicate with each other, and conduct transactions. We are not a party to any transaction between buyers and sellers.`,
  },
  {
    id: 'accounts',
    title: '3. User Accounts',
    content: `You must create an account to use certain features of our service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.`,
  },
  {
    id: 'conduct',
    title: '4. User Conduct',
    content: `You agree not to use the service to: post false, misleading, or fraudulent content; engage in any illegal activities; harass, abuse, or harm other users; violate any applicable laws or regulations; or interfere with the proper functioning of the service.`,
  },
  {
    id: 'transactions',
    title: '5. Transactions',
    content: `All transactions are between buyers and sellers. We are not responsible for the quality, safety, or legality of items listed, the truth or accuracy of listings, or the ability of sellers to sell items or buyers to pay for items.`,
  },
  {
    id: 'fees',
    title: '6. Fees and Payments',
    content: `We may charge fees for certain services. All fees are clearly disclosed before you incur them. You are responsible for paying all applicable taxes. Payment processing is handled by third-party providers.`,
  },
  {
    id: 'intellectual',
    title: '7. Intellectual Property',
    content: `The service and its original content, features, and functionality are owned by Marketplace and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.`,
  },
  {
    id: 'termination',
    title: '8. Termination',
    content: `We may terminate or suspend your account and access to the service immediately, without prior notice, for any reason, including breach of these terms. Upon termination, your right to use the service will cease immediately.`,
  },
  {
    id: 'limitation',
    title: '9. Limitation of Liability',
    content: `In no event shall Marketplace be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, goodwill, or other intangible losses.`,
  },
  {
    id: 'changes',
    title: '10. Changes to Terms',
    content: `We reserve the right to modify these terms at any time. If we make material changes, we will notify you through the app or by email. Your continued use of the service after such changes constitutes acceptance of the new terms.`,
  },
];

const privacyPolicy: LegalSection[] = [
  {
    id: 'information',
    title: '1. Information We Collect',
    content: `We collect information you provide directly (name, email, phone number), information from your use of our service (location data, device information, usage patterns), and information from third parties (payment processors, social media platforms if you connect them).`,
  },
  {
    id: 'usage',
    title: '2. How We Use Your Information',
    content: `We use your information to provide and improve our services, process transactions, communicate with you, ensure security and prevent fraud, comply with legal obligations, and personalize your experience.`,
  },
  {
    id: 'sharing',
    title: '3. Information Sharing',
    content: `We share your information with other users as necessary for transactions, with service providers who help us operate our platform, with law enforcement when required by law, and with your consent for other purposes.`,
  },
  {
    id: 'security',
    title: '4. Data Security',
    content: `We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure.`,
  },
  {
    id: 'retention',
    title: '5. Data Retention',
    content: `We retain your information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your data subject to certain limitations.`,
  },
  {
    id: 'rights',
    title: '6. Your Rights',
    content: `You have the right to access, update, or delete your personal information, object to processing, request data portability, and withdraw consent where applicable. Contact us to exercise these rights.`,
  },
  {
    id: 'cookies',
    title: '7. Cookies and Tracking',
    content: `We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your device settings.`,
  },
  {
    id: 'children',
    title: '8. Children\'s Privacy',
    content: `Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.`,
  },
  {
    id: 'international',
    title: '9. International Transfers',
    content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during such transfers.`,
  },
  {
    id: 'updates',
    title: '10. Policy Updates',
    content: `We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy in the app and updating the "Last Updated" date.`,
  },
];

export default function LegalScreen() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const router = useRouter();

  const handleSectionPress = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const currentSections = activeTab === 'terms' ? termsOfService : privacyPolicy;

  const LegalSectionComponent = ({ section }: { section: LegalSection }) => (
    <TouchableOpacity
      style={styles.sectionCard}
      onPress={() => handleSectionPress(section.id)}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionToggle}>
          {expandedSection === section.id ? '−' : '+'}
        </Text>
      </View>
      {expandedSection === section.id && (
        <Text style={styles.sectionContent}>{section.content}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
          onPress={() => setActiveTab('terms')}
        >
          <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>
            Terms of Service
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>
            {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
          </Text>
          <Text style={styles.introSubtitle}>
            Last updated: January 15, 2024
          </Text>
          <Text style={styles.introText}>
            {activeTab === 'terms' 
              ? 'Please read these Terms of Service carefully before using our marketplace application. These terms govern your use of our service and constitute a legally binding agreement between you and Marketplace.'
              : 'This Privacy Policy describes how we collect, use, and protect your personal information when you use our marketplace application. We are committed to protecting your privacy and being transparent about our data practices.'
            }
          </Text>
        </View>

        <View style={styles.sectionsContainer}>
          {currentSections.map((section) => (
            <LegalSectionComponent key={section.id} section={section} />
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Questions?</Text>
          <Text style={styles.contactText}>
            If you have any questions about these {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}, please contact us:
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>📧 legal@marketplace.com</Text>
            <Text style={styles.contactItem}>📞 +1 (555) 123-4567</Text>
            <Text style={styles.contactItem}>📍 123 Business Ave, Suite 100, City, State 12345</Text>
          </View>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            By using Marketplace, you acknowledge that you have read and understood these terms and agree to be bound by them.
          </Text>
          <Text style={styles.versionText}>
            Document Version: 1.0
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  introSection: {
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
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  introText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  sectionsContainer: {
    marginHorizontal: 16,
    gap: 8,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  sectionToggle: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  sectionContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginTop: 12,
  },
  contactSection: {
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
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerSection: {
    backgroundColor: '#f8f9fa',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 10,
    color: '#9ca3af',
  },
});