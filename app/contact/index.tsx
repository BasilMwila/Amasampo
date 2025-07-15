/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
// File: app/contact/index.tsx
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
    View,
} from 'react-native';
import { useAuth } from '../_layout';

export default function ContactScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Message Sent',
        'Thank you for contacting us! We will get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      
      setSubject('');
      setMessage('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@marketplace.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+15551234567');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <Text style={styles.sectionSubtitle}>
            We'd love to hear from you! Send us a message and we'll get back to you as soon as possible.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <TextInput
                style={styles.input}
                placeholder="How can we help you?"
                value={subject}
                onChangeText={setSubject}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us more about your question or issue..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                maxLength={1000}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {message.length}/1000 characters
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Sending...' : 'Send Message'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Ways to Reach Us</Text>
          
          <View style={styles.contactMethods}>
            <TouchableOpacity style={styles.contactMethod} onPress={handleEmailPress}>
              <View style={styles.contactMethodIcon}>
                <Text style={styles.contactMethodIconText}>📧</Text>
              </View>
              <View style={styles.contactMethodInfo}>
                <Text style={styles.contactMethodTitle}>Email</Text>
                <Text style={styles.contactMethodText}>support@marketplace.com</Text>
                <Text style={styles.contactMethodSubtext}>We typically respond within 24 hours</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactMethod} onPress={handlePhonePress}>
              <View style={styles.contactMethodIcon}>
                <Text style={styles.contactMethodIconText}>📞</Text>
              </View>
              <View style={styles.contactMethodInfo}>
                <Text style={styles.contactMethodTitle}>Phone</Text>
                <Text style={styles.contactMethodText}>+1 (555) 123-4567</Text>
                <Text style={styles.contactMethodSubtext}>Mon-Fri, 9AM-6PM EST</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.contactMethod}>
              <View style={styles.contactMethodIcon}>
                <Text style={styles.contactMethodIconText}>📍</Text>
              </View>
              <View style={styles.contactMethodInfo}>
                <Text style={styles.contactMethodTitle}>Address</Text>
                <Text style={styles.contactMethodText}>123 Business Avenue</Text>
                <Text style={styles.contactMethodText}>Suite 100</Text>
                <Text style={styles.contactMethodText}>City, State 12345</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Text style={styles.sectionSubtitle}>
            Before contacting us, you might find your answer in our FAQ section.
          </Text>
          
          <TouchableOpacity
            style={styles.faqButton}
            onPress={() => router.push('/help' as any)}
          >
            <Text style={styles.faqButtonText}>View FAQ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report an Issue</Text>
          <Text style={styles.sectionSubtitle}>
            If you're experiencing technical problems or want to report inappropriate content, 
            please use our dedicated reporting system.
          </Text>
          
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => router.push('/help/report' as any)}
          >
            <Text style={styles.reportButtonText}>Report Issue</Text>
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactMethods: {
    gap: 16,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  contactMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactMethodIconText: {
    fontSize: 20,
  },
  contactMethodInfo: {
    flex: 1,
  },
  contactMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  contactMethodText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  contactMethodSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  faqButton: {
    backgroundColor: '#f0f9ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  faqButtonText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  reportButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
});