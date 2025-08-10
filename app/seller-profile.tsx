// app/seller-profile.tsx - Seller Profile Management
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from './_layout';
import { apiService } from './services/api';

export default function SellerProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shop_address: '',
    shop_city: '',
    shop_state: '',
    shop_country: 'Ghana',
    latitude: '',
    longitude: '',
    shop_description: '',
  });

  useEffect(() => {
    if (user?.user_type !== 'seller') {
      Alert.alert('Access Denied', 'Only sellers can access this page');
      router.back();
      return;
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Load current profile data if available
      console.log('Loading seller profile...');
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const updateLocation = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.shop_address || !formData.shop_city || !formData.latitude || !formData.longitude) {
        Alert.alert('Missing Information', 'Please fill in address, city, latitude, and longitude');
        return;
      }

      // Validate coordinates
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude values');
        return;
      }

      const locationData = {
        shop_address: formData.shop_address,
        shop_city: formData.shop_city,
        shop_state: formData.shop_state,
        shop_country: formData.shop_country,
        latitude: lat,
        longitude: lng,
        shop_description: formData.shop_description,
        business_hours: {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '16:00', closed: false },
          sunday: { open: '10:00', close: '14:00', closed: false }
        }
      };

      await apiService.updateSellerLocation(locationData);
      
      Alert.alert('Success', 'Your shop location has been updated! You will now appear on the map.', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error) {
      console.error('Update location error:', error);
      Alert.alert('Error', 'Failed to update location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSampleLocation = () => {
    Alert.alert(
      'Add Sample Location',
      'This will add a sample location in Accra, Ghana for testing',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: () => {
            setFormData({
              shop_address: '123 Oxford Street, Osu',
              shop_city: 'Accra',
              shop_state: 'Greater Accra',
              shop_country: 'Ghana',
              latitude: '5.5557',
              longitude: '-0.1963',
              shop_description: 'Electronics and gadgets store in the heart of Osu'
            });
          }
        }
      ]
    );
  };

  if (user?.user_type !== 'seller') {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Shop Location</Text>
        <TouchableOpacity onPress={addSampleLocation}>
          <Text style={styles.sampleButton}>Sample</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>
          Add your shop location to appear on the map for buyers to find you easily.
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Shop Address *</Text>
          <TextInput
            style={styles.input}
            value={formData.shop_address}
            onChangeText={(text) => setFormData({ ...formData, shop_address: text })}
            placeholder="Enter your shop address"
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={formData.shop_city}
            onChangeText={(text) => setFormData({ ...formData, shop_city: text })}
            placeholder="e.g. Accra"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>State/Region</Text>
          <TextInput
            style={styles.input}
            value={formData.shop_state}
            onChangeText={(text) => setFormData({ ...formData, shop_state: text })}
            placeholder="e.g. Greater Accra"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            value={formData.shop_country}
            onChangeText={(text) => setFormData({ ...formData, shop_country: text })}
            placeholder="Ghana"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfSection}>
            <Text style={styles.label}>Latitude *</Text>
            <TextInput
              style={styles.input}
              value={formData.latitude}
              onChangeText={(text) => setFormData({ ...formData, latitude: text })}
              placeholder="5.5557"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.halfSection}>
            <Text style={styles.label}>Longitude *</Text>
            <TextInput
              style={styles.input}
              value={formData.longitude}
              onChangeText={(text) => setFormData({ ...formData, longitude: text })}
              placeholder="-0.1963"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Shop Description</Text>
          <TextInput
            style={styles.input}
            value={formData.shop_description}
            onChangeText={(text) => setFormData({ ...formData, shop_description: text })}
            placeholder="Describe what you sell..."
            multiline
            numberOfLines={3}
          />
        </View>

        <Text style={styles.helpText}>
          💡 To get coordinates: Use Google Maps, right-click your location, and copy the coordinates.
        </Text>

        <TouchableOpacity 
          style={[styles.updateButton, loading && styles.disabled]} 
          onPress={updateLocation}
          disabled={loading}
        >
          <Text style={styles.updateButtonText}>
            {loading ? 'Updating...' : 'Update Location'}
          </Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  sampleButton: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfSection: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  updateButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  disabled: {
    backgroundColor: '#9ca3af',
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});