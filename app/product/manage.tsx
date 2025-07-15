// File: app/products/manage.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../_layout';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  soldQuantity: number;
  views: number;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Organic Apples',
    price: 2.99,
    quantity: 47,
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop',
    description: 'Fresh organic apples from our farm',
    isActive: true,
    createdAt: '2024-01-10T10:30:00Z',
    soldQuantity: 23,
    views: 156,
  },
  {
    id: 2,
    name: 'Local Honey',
    price: 8.99,
    quantity: 12,
    category: 'Pantry',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=200&fit=crop',
    description: 'Pure local honey from our beehives',
    isActive: true,
    createdAt: '2024-01-08T15:45:00Z',
    soldQuantity: 15,
    views: 89,
  },
  {
    id: 3,
    name: 'Tomato Seeds',
    price: 1.50,
    quantity: 0,
    category: 'Seeds',
    image: 'https://images.unsplash.com/photo-1592841200221-9c8c52c7e0e6?w=300&h=200&fit=crop',
    description: 'Heirloom tomato seeds for your garden',
    isActive: false,
    createdAt: '2024-01-05T12:20:00Z',
    soldQuantity: 8,
    views: 34,
  },
];

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
  });
  const { user } = useAuth();
  const router = useRouter();

  const toggleProductStatus = (productId: number) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, isActive: !product.isActive }
        : product
    ));
  };

  const deleteProduct = (productId: number) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProducts(products.filter(product => product.id !== productId));
            Alert.alert('Success', 'Product deleted successfully');
          },
        },
      ]
    );
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      description: product.description,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedProduct) return;

    if (!editForm.name.trim() || !editForm.price || !editForm.quantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const updatedProduct = {
      ...selectedProduct,
      name: editForm.name.trim(),
      price: parseFloat(editForm.price),
      quantity: parseInt(editForm.quantity),
      description: editForm.description.trim(),
    };

    setProducts(products.map(product => 
      product.id === selectedProduct.id ? updatedProduct : product
    ));

    setShowEditModal(false);
    setSelectedProduct(null);
    Alert.alert('Success', 'Product updated successfully');
  };

  const duplicateProduct = (product: Product) => {
    const duplicatedProduct = {
      ...product,
      id: Date.now(),
      name: `${product.name} (Copy)`,
      createdAt: new Date().toISOString(),
      soldQuantity: 0,
      views: 0,
    };

    setProducts([duplicatedProduct, ...products]);
    Alert.alert('Success', 'Product duplicated successfully');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <View style={[styles.productCard, !product.isActive && styles.inactiveCard]}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      
      <View style={styles.productDetails}>
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: product.isActive ? '#10b981' : '#ef4444' }
          ]}>
            <Text style={styles.statusText}>
              {product.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <Text style={styles.productCategory}>{product.category}</Text>
        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>

        <View style={styles.productStats}>
          <Text style={styles.statText}>Stock: {product.quantity}</Text>
          <Text style={styles.statText}>Sold: {product.soldQuantity}</Text>
          <Text style={styles.statText}>Views: {product.views}</Text>
        </View>

        <Text style={styles.productDate}>Listed {formatDate(product.createdAt)}</Text>

        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(product)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.toggleButton]}
            onPress={() => toggleProductStatus(product.id)}
          >
            <Text style={styles.actionButtonText}>
              {product.isActive ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              Alert.alert(
                'Product Actions',
                'Choose an action',
                [
                  { text: 'View Product', onPress: () => router.push(`/product/${product.id}` as any) },
                  { text: 'Duplicate', onPress: () => duplicateProduct(product) },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteProduct(product.id) },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          >
            <Text style={styles.moreButtonText}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (user?.type !== 'seller') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product management is only available for sellers</Text>
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
        <Text style={styles.headerTitle}>Manage Products</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/product' as any)}>
          <Text style={styles.addButton}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{products.filter(p => p.isActive).length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{products.filter(p => p.quantity === 0).length}</Text>
          <Text style={styles.statLabel}>Out of Stock</Text>
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📦</Text>
            <Text style={styles.emptyStateTitle}>No products yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start by adding your first product to your catalog
            </Text>
            <TouchableOpacity
              style={styles.addFirstProductButton}
              onPress={() => router.push('/(tabs)/product' as any)}
            >
              <Text style={styles.addFirstProductText}>Add Your First Product</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Edit Product Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Product</Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                style={styles.input}
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="Enter product name"
                maxLength={100}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>Price *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.price}
                  onChangeText={(text) => setEditForm({ ...editForm, price: text })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.quantity}
                  onChangeText={(text) => setEditForm({ ...editForm, quantity: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editForm.description}
                onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                placeholder="Describe your product..."
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>
          </View>
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
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveCard: {
    opacity: 0.7,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  productCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  productStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
  },
  productDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 12,
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toggleButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  moreButton: {
    padding: 8,
  },
  moreButtonText: {
    fontSize: 16,
    color: '#6b7280',
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
  addFirstProductButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstProductText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
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
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
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
    height: 100,
    textAlignVertical: 'top',
  },
});