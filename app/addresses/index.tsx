// File: app/addresses/index.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../_layout';

interface Address {
  id: number;
  name: string;
  type: 'home' | 'work' | 'other';
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  deliveryInstructions?: string;
}

const mockAddresses: Address[] = [
  {
    id: 1,
    name: 'Home',
    type: 'home',
    fullName: 'John Doe',
    phoneNumber: '+1 (555) 123-4567',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'Downtown',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    isDefault: true,
    deliveryInstructions: 'Leave at front door if no answer',
  },
  {
    id: 2,
    name: 'Work',
    type: 'work',
    fullName: 'John Doe',
    phoneNumber: '+1 (555) 123-4567',
    addressLine1: '456 Business Avenue',
    addressLine2: 'Suite 200',
    city: 'Business District',
    state: 'NY',
    zipCode: '10002',
    country: 'United States',
    isDefault: false,
    deliveryInstructions: 'Call when arriving, reception desk',
  },
  {
    id: 3,
    name: "Mom's House",
    type: 'other',
    fullName: 'Jane Doe',
    phoneNumber: '+1 (555) 987-6543',
    addressLine1: '789 Oak Road',
    city: 'Suburbia',
    state: 'NY',
    zipCode: '10003',
    country: 'United States',
    isDefault: false,
  },
];

export default function AddressManagement() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    type: 'home' as 'home' | 'work' | 'other',
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    deliveryInstructions: '',
  });
  const { user } = useAuth();
  const router = useRouter();

  const resetForm = () => {
    setAddressForm({
      name: '',
      type: 'home',
      fullName: user?.name || '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      deliveryInstructions: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingAddress(null);
    setShowAddModal(true);
  };

  const openEditModal = (address: Address) => {
    setAddressForm({
      name: address.name,
      type: address.type,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      deliveryInstructions: address.deliveryInstructions || '',
    });
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const validateForm = () => {
    if (!addressForm.name.trim()) {
      Alert.alert('Error', 'Please enter an address name');
      return false;
    }
    if (!addressForm.fullName.trim()) {
      Alert.alert('Error', 'Please enter the full name');
      return false;
    }
    if (!addressForm.phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return false;
    }
    if (!addressForm.addressLine1.trim()) {
      Alert.alert('Error', 'Please enter the street address');
      return false;
    }
    if (!addressForm.city.trim()) {
      Alert.alert('Error', 'Please enter the city');
      return false;
    }
    if (!addressForm.state.trim()) {
      Alert.alert('Error', 'Please enter the state');
      return false;
    }
    if (!addressForm.zipCode.trim()) {
      Alert.alert('Error', 'Please enter the ZIP code');
      return false;
    }
    return true;
  };

  const handleSaveAddress = () => {
    if (!validateForm()) return;

    if (editingAddress) {
      // Update existing address
      const updatedAddress = {
        ...editingAddress,
        ...addressForm,
        name: addressForm.name.trim(),
        fullName: addressForm.fullName.trim(),
        phoneNumber: addressForm.phoneNumber.trim(),
        addressLine1: addressForm.addressLine1.trim(),
        addressLine2: addressForm.addressLine2.trim() || undefined,
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        zipCode: addressForm.zipCode.trim(),
        deliveryInstructions: addressForm.deliveryInstructions.trim() || undefined,
      };

      setAddresses(addresses.map(addr => 
        addr.id === editingAddress.id ? updatedAddress : addr
      ));
      Alert.alert('Success', 'Address updated successfully');
    } else {
      // Add new address
      const newAddress: Address = {
        id: Date.now(),
        ...addressForm,
        name: addressForm.name.trim(),
        fullName: addressForm.fullName.trim(),
        phoneNumber: addressForm.phoneNumber.trim(),
        addressLine1: addressForm.addressLine1.trim(),
        addressLine2: addressForm.addressLine2.trim() || undefined,
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        zipCode: addressForm.zipCode.trim(),
        deliveryInstructions: addressForm.deliveryInstructions.trim() || undefined,
        isDefault: addresses.length === 0, // First address is default
      };

      setAddresses([...addresses, newAddress]);
      Alert.alert('Success', 'Address added successfully');
    }

    setShowAddModal(false);
    setEditingAddress(null);
  };

  const handleSetDefault = (addressId: number) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    })));
    Alert.alert('Success', 'Default address updated');
  };

  const handleDeleteAddress = (addressId: number) => {
    const addressToDelete = addresses.find(addr => addr.id === addressId);
    if (addressToDelete?.isDefault && addresses.length > 1) {
      Alert.alert('Error', 'Cannot delete default address. Set another address as default first.');
      return;
    }

    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses(addresses.filter(addr => addr.id !== addressId));
            Alert.alert('Success', 'Address deleted successfully');
          },
        },
      ]
    );
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return '🏠';
      case 'work': return '🏢';
      case 'other': return '📍';
      default: return '📍';
    }
  };

  const formatAddress = (address: Address) => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.zipCode}`,
    ].filter(Boolean);
    return parts.join('\n');
  };

  const AddressCard = ({ address }: { address: Address }) => (
    <View style={[styles.addressCard, address.isDefault && styles.defaultCard]}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTitleRow}>
          <Text style={styles.addressTypeIcon}>
            {getAddressTypeIcon(address.type)}
          </Text>
          <Text style={styles.addressName}>{address.name}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.addressDetails}>
        <Text style={styles.fullName}>{address.fullName}</Text>
        <Text style={styles.phoneNumber}>{address.phoneNumber}</Text>
        <Text style={styles.addressText}>{formatAddress(address)}</Text>
        
        {address.deliveryInstructions && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsLabel}>Delivery Instructions:</Text>
            <Text style={styles.instructionsText}>{address.deliveryInstructions}</Text>
          </View>
        )}
      </View>

      <View style={styles.addressActions}>
        {!address.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(address.id)}
          >
            <Text style={styles.actionButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(address)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteAddress(address.id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Addresses</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Text style={styles.addButton}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <AddressCard address={item} />}
        contentContainerStyle={styles.addressesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📍</Text>
            <Text style={styles.emptyStateTitle}>No addresses saved</Text>
            <Text style={styles.emptyStateSubtitle}>
              Add a delivery address to place orders
            </Text>
            <TouchableOpacity style={styles.addFirstAddressButton} onPress={openAddModal}>
              <Text style={styles.addFirstAddressText}>Add Your First Address</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add/Edit Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingAddress ? 'Edit Address' : 'Add Address'}
            </Text>
            <TouchableOpacity onPress={handleSaveAddress}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Address Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Home, Work, Mom's House"
                  value={addressForm.name}
                  onChangeText={(text) => setAddressForm({ ...addressForm, name: text })}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address Type</Text>
                <View style={styles.typeSelector}>
                  {(['home', 'work', 'other'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        addressForm.type === type && styles.typeButtonSelected,
                      ]}
                      onPress={() => setAddressForm({ ...addressForm, type })}
                    >
                      <Text style={styles.typeIcon}>{getAddressTypeIcon(type)}</Text>
                      <Text
                        style={[
                          styles.typeButtonText,
                          addressForm.type === type && styles.typeButtonTextSelected,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  value={addressForm.fullName}
                  onChangeText={(text) => setAddressForm({ ...addressForm, fullName: text })}
                  maxLength={100}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+1 (555) 123-4567"
                  value={addressForm.phoneNumber}
                  onChangeText={(text) => setAddressForm({ ...addressForm, phoneNumber: text })}
                  keyboardType="phone-pad"
                  maxLength={20}
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Address</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Street Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123 Main Street"
                  value={addressForm.addressLine1}
                  onChangeText={(text) => setAddressForm({ ...addressForm, addressLine1: text })}
                  maxLength={100}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Apartment, Suite, etc.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Apt 4B, Suite 200 (optional)"
                  value={addressForm.addressLine2}
                  onChangeText={(text) => setAddressForm({ ...addressForm, addressLine2: text })}
                  maxLength={100}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.flexInput]}>
                  <Text style={styles.inputLabel}>City *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={addressForm.city}
                    onChangeText={(text) => setAddressForm({ ...addressForm, city: text })}
                    maxLength={50}
                  />
                </View>

                <View style={[styles.inputGroup, styles.smallInput]}>
                  <Text style={styles.inputLabel}>State *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="NY"
                    value={addressForm.state}
                    onChangeText={(text) => setAddressForm({ ...addressForm, state: text })}
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={[styles.inputGroup, styles.mediumInput]}>
                  <Text style={styles.inputLabel}>ZIP Code *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10001"
                    value={addressForm.zipCode}
                    onChangeText={(text) => setAddressForm({ ...addressForm, zipCode: text })}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Country</Text>
                <TextInput
                  style={styles.input}
                  value={addressForm.country}
                  onChangeText={(text) => setAddressForm({ ...addressForm, country: text })}
                  maxLength={50}
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Delivery Instructions</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Special Instructions</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Leave at front door, call when arriving, etc."
                  value={addressForm.deliveryInstructions}
                  onChangeText={(text) => setAddressForm({ ...addressForm, deliveryInstructions: text })}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  addButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  addressesList: {
    padding: 16,
  },
  addressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultCard: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  addressHeader: {
    marginBottom: 12,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTypeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  addressName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  addressDetails: {
    marginBottom: 16,
  },
  fullName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  instructionsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  instructionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  deleteButtonText: {
    color: '#dc2626',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addFirstAddressButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstAddressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexInput: {
    flex: 2,
  },
  smallInput: {
    flex: 0.5,
  },
  mediumInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  typeButtonTextSelected: {
    color: '#ffffff',
  },
});