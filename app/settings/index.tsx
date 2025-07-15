// File: app/settings/index.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../_layout';

interface SettingsState {
  notifications: {
    orderUpdates: boolean;
    newMessages: boolean;
    promotions: boolean;
    newReviews: boolean;
    lowStock: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showLocation: boolean;
    allowReviews: boolean;
  };
  preferences: {
    darkMode: boolean;
    language: string;
    currency: string;
    units: 'metric' | 'imperial';
  };
}

export default function SettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      orderUpdates: true,
      newMessages: true,
      promotions: false,
      newReviews: true,
      lowStock: user?.type === 'seller',
    },
    privacy: {
      showOnlineStatus: true,
      showLocation: true,
      allowReviews: true,
    },
    preferences: {
      darkMode: false,
      language: 'English',
      currency: 'USD',
      units: 'metric',
    },
  });

  const updateNotificationSetting = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updatePrivacySetting = (key: keyof typeof settings.privacy, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  const updatePreferenceSetting = (key: keyof typeof settings.preferences, value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  const handleLanguageSelect = () => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      [
        { text: 'English', onPress: () => updatePreferenceSetting('language', 'English') },
        { text: 'Spanish', onPress: () => updatePreferenceSetting('language', 'Spanish') },
        { text: 'French', onPress: () => updatePreferenceSetting('language', 'French') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCurrencySelect = () => {
    Alert.alert(
      'Select Currency',
      'Choose your preferred currency',
      [
        { text: 'USD ($)', onPress: () => updatePreferenceSetting('currency', 'USD') },
        { text: 'EUR (€)', onPress: () => updatePreferenceSetting('currency', 'EUR') },
        { text: 'GBP (£)', onPress: () => updatePreferenceSetting('currency', 'GBP') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleUnitsSelect = () => {
    Alert.alert(
      'Select Units',
      'Choose your preferred measurement system',
      [
        { text: 'Metric (km, kg)', onPress: () => updatePreferenceSetting('units', 'metric') },
        { text: 'Imperial (mi, lb)', onPress: () => updatePreferenceSetting('units', 'imperial') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              notifications: {
                orderUpdates: true,
                newMessages: true,
                promotions: false,
                newReviews: true,
                lowStock: user?.type === 'seller',
              },
              privacy: {
                showOnlineStatus: true,
                showLocation: true,
                allowReviews: true,
              },
              preferences: {
                darkMode: false,
                language: 'English',
                currency: 'USD',
                units: 'metric',
              },
            });
            Alert.alert('Success', 'Settings have been reset to default');
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    type = 'switch',
    onPress 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value?: boolean | string;
    onValueChange?: (value: boolean) => void;
    type?: 'switch' | 'select';
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={type === 'select' ? onPress : undefined}
      disabled={type === 'switch'}
    >
      <View style={styles.settingInfo}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      {type === 'switch' ? (
        <Switch
          value={value as boolean}
          onValueChange={onValueChange}
          trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
          thumbColor={value ? '#3b82f6' : '#f3f4f6'}
        />
      ) : (
        <View style={styles.selectValue}>
          <Text style={styles.selectValueText}>{value}</Text>
          <Text style={styles.selectArrow}>›</Text>
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
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={handleResetSettings}>
          <Text style={styles.resetButton}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          
          <SettingItem
            icon="📦"
            title="Order Updates"
            subtitle="Get notified about order status changes"
            value={settings.notifications.orderUpdates}
            onValueChange={(value) => updateNotificationSetting('orderUpdates', value)}
          />
          
          <SettingItem
            icon="💬"
            title="New Messages"
            subtitle="Get notified when you receive messages"
            value={settings.notifications.newMessages}
            onValueChange={(value) => updateNotificationSetting('newMessages', value)}
          />
          
          <SettingItem
            icon="🎉"
            title="Promotions & Offers"
            subtitle="Receive special offers and promotions"
            value={settings.notifications.promotions}
            onValueChange={(value) => updateNotificationSetting('promotions', value)}
          />
          
          <SettingItem
            icon="⭐"
            title="New Reviews"
            subtitle="Get notified when you receive reviews"
            value={settings.notifications.newReviews}
            onValueChange={(value) => updateNotificationSetting('newReviews', value)}
          />
          
          {user?.type === 'seller' && (
            <SettingItem
              icon="📉"
              title="Low Stock Alerts"
              subtitle="Get notified when products are running low"
              value={settings.notifications.lowStock}
              onValueChange={(value) => updateNotificationSetting('lowStock', value)}
            />
          )}
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Privacy & Security</Text>
          
          <SettingItem
            icon="🟢"
            title="Show Online Status"
            subtitle="Let others see when you're online"
            value={settings.privacy.showOnlineStatus}
            onValueChange={(value) => updatePrivacySetting('showOnlineStatus', value)}
          />
          
          <SettingItem
            icon="📍"
            title="Show Location"
            subtitle="Share your approximate location with buyers"
            value={settings.privacy.showLocation}
            onValueChange={(value) => updatePrivacySetting('showLocation', value)}
          />
          
          <SettingItem
            icon="⭐"
            title="Allow Reviews"
            subtitle="Allow others to review your products/service"
            value={settings.privacy.allowReviews}
            onValueChange={(value) => updatePrivacySetting('allowReviews', value)}
          />
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/settings/security' as any)}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🔐</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Security Settings</Text>
                <Text style={styles.settingSubtitle}>Password, two-factor authentication</Text>
              </View>
            </View>
            <Text style={styles.selectArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Preferences</Text>
          
          <SettingItem
            icon="🌙"
            title="Dark Mode"
            subtitle="Use dark theme throughout the app"
            value={settings.preferences.darkMode}
            onValueChange={(value) => updatePreferenceSetting('darkMode', value)}
          />
          
          <SettingItem
            icon="🌐"
            title="Language"
            subtitle="Choose your preferred language"
            value={settings.preferences.language}
            type="select"
            onPress={handleLanguageSelect}
          />
          
          <SettingItem
            icon="💰"
            title="Currency"
            subtitle="Select your preferred currency"
            value={settings.preferences.currency}
            type="select"
            onPress={handleCurrencySelect}
          />
          
          <SettingItem
            icon="📏"
            title="Units"
            subtitle="Choose measurement system"
            value={settings.preferences.units === 'metric' ? 'Metric (km, kg)' : 'Imperial (mi, lb)'}
            type="select"
            onPress={handleUnitsSelect}
          />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Account</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/profile/edit' as any)}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>✏️</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Edit Profile</Text>
                <Text style={styles.settingSubtitle}>Update your personal information</Text>
              </View>
            </View>
            <Text style={styles.selectArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/addresses' as any)}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📍</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Delivery Addresses</Text>
                <Text style={styles.settingSubtitle}>Manage your delivery locations</Text>
              </View>
            </View>
            <Text style={styles.selectArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/payment/methods' as any)}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>💳</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Payment Methods</Text>
                <Text style={styles.settingSubtitle}>Manage cards and payment options</Text>
              </View>
            </View>
            <Text style={styles.selectArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🆘 Support & Legal</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/help' as any)}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>❓</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Help Center</Text>
                <Text style={styles.settingSubtitle}>FAQs and support articles</Text>
              </View>
            </View>
            <Text style={styles.selectArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/contact' as any)}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📧</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Contact Us</Text>
                <Text style={styles.settingSubtitle}>Get in touch with our support team</Text>
              </View>
            </View>
            <Text style={styles.selectArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/legal' as any)}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📄</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Terms & Privacy</Text>
                <Text style={styles.settingSubtitle}>Legal agreements and policies</Text>
              </View>
            </View>
            <Text style={styles.selectArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Marketplace v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>Built with ❤️ for local communities</Text>
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
  resetButton: {
    fontSize: 16,
    color: '#ef4444',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  settingText: {
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
  selectValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectValueText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  selectArrow: {
    fontSize: 20,
    color: '#9ca3af',
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