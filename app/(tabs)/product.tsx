/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// app/(tabs)/product.tsx - Enhanced with consistent image handling
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../_layout';
import { COLORS, DEFAULT_IMAGES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/constants';
import { apiService } from '../services/api';

interface Category {
  id: number;
  name: string;
  icon?: string;
}

interface ProductImage {
  uri: string;
  name: string;
  type: string;
}

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const { user } = useAuth();

  // Load categories when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCategories();
      requestPermissions();
    }, [])
  );

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need camera roll permissions to upload product images.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
        ]
      );
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await apiService.getCategories();
      setCategories(response.categories || []);
      
      // Set first category as default if available
      if (response.categories && response.categories.length > 0 && !categoryId) {
        setCategoryId(response.categories[0].id);
      }
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setLoadingCategories(false);
    }
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [1, 1],
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newImages: ProductImage[] = result.assets.map((asset, index) => {
          // Get file extension from URI or default to jpg
          const uriParts = asset.uri.split('.');
          const fileExtension = uriParts[uriParts.length - 1] || 'jpg';
          
          return {
            uri: asset.uri,
            name: `product_image_${Date.now()}_${index}.${fileExtension}`,
            type: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
          };
        });

        setProductImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        aspect: [1, 1],
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        // Get file extension from URI or default to jpg
        const uriParts = asset.uri.split('.');
        const fileExtension = uriParts[uriParts.length - 1] || 'jpg';
        
        const newImage: ProductImage = {
          uri: asset.uri,
          name: `product_photo_${Date.now()}.${fileExtension}`,
          type: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
        };

        setProductImages(prev => [...prev, newImage].slice(0, 5));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (productImages.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const image of productImages) {
        // Create properly formatted FormData for React Native
        const formData = new FormData();
        
        // Format the image object correctly for React Native
        const imageObject = {
          uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `image_${Date.now()}.jpg`,
        };

        // Append the image with the correct format
        formData.append('image', imageObject as any);

        console.log('Uploading image:', imageObject);

        const response = await apiService.uploadProductImage(formData);
        uploadedUrls.push(response.image_url);
      }

      return uploadedUrls;
    } catch (error: any) {
      console.error('Error uploading images:', error);
      
      // More specific error messages
      if (error.message?.includes('Network')) {
        throw new Error('Network error. Please check your connection and try again.');
      } else if (error.message?.includes('size')) {
        throw new Error('Image file is too large. Please choose a smaller image.');
      } else if (error.message?.includes('format')) {
        throw new Error('Invalid image format. Please use JPG or PNG images.');
      } else {
        throw new Error('Failed to upload images. Please try again.');
      }
    } finally {
      setUploadingImages(false);
    }
  };

  const testUploadConnection = async () => {
    try {
      console.log('Testing backend connection...');
      console.log('API Base URL:', apiService.getBaseURL());
      
      const isConnected = await apiService.checkConnection();
      console.log('Backend connection test:', isConnected ? 'SUCCESS' : 'FAILED');
      
      if (!isConnected) {
        Alert.alert(
          'Connection Error', 
          'Cannot connect to the backend server. Please check your network connection and ensure the backend is running.',
          [
            { text: 'OK' },
            { 
              text: 'Check Settings', 
              onPress: () => {
                console.log('Current API URL:', apiService.getBaseURL());
                Alert.alert('API Settings', `Current API URL: ${apiService.getBaseURL()}\n\nMake sure your backend server is running and accessible.`);
              }
            }
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setQuantity('');
    setDescription('');
    setProductImages([]);
    setCategoryId(categories.length > 0 ? categories[0].id : null);
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return false;
    }
    
    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    
    if (!quantity || parseInt(quantity) < 0) {
      Alert.alert('Error', 'Please enter a valid quantity (0 or more)');
      return false;
    }
    
    if (!categoryId) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a product description');
      return false;
    }
    
    if (description.trim().length < 10) {
      Alert.alert('Error', 'Description must be at least 10 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Test connection first
    const isConnected = await testUploadConnection();
    if (!isConnected) {
      Alert.alert('Connection Error', 'Please check your connection and try again.');
      return;
    }

    setLoading(true);
    
    try {
      // Upload images first
      const imageUrls = await uploadImages();

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity),
        category_id: categoryId!,
        image_url: imageUrls.length > 0 ? imageUrls[0] : undefined,
        images: imageUrls.length > 1 ? imageUrls : undefined,
      };

      const response = await apiService.createProduct(productData);
      
      Alert.alert(
        'Success!',
        SUCCESS_MESSAGES.PRODUCT_CREATED,
        [
          {
            text: 'Add Another',
            onPress: resetForm,
          },
          {
            text: 'Done',
            onPress: resetForm,
            style: 'default',
          },
        ]
      );
      
    } catch (error: any) {
      console.error('Failed to create product:', error);
      
      let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
      
      if (error.message) {
        if (error.message.includes('Validation')) {
          errorMessage = 'Please check your product information and try again.';
        } else if (error.message.includes('Network')) {
          errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
        } else if (error.message.includes('Unauthorized')) {
          errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Product Image',
      'Choose how you want to add an image',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImages },
      ]
    );
  };

  const getSelectedCategoryName = () => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Select Category';
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'Electronics': '📱',
      'Clothing': '👕',
      'Food': '🍎',
      'Home & Garden': '🏡',
      'Sports & Recreation': '⚽',
      'Books & Media': '📚',
      'Toys & Games': '🧸',
      'Health & Beauty': '💄',
      'Automotive': '🚗',
      'Arts & Crafts': '🎨',
      'Services': '🔧',
    };
    return iconMap[categoryName] || '📦';
  };

  // Image component with error handling
  const ProductImagePreview = ({ image, index }: { image: ProductImage; index: number }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageError = () => {
      console.log('Preview image failed to load:', image.name);
      setImageError(true);
      setImageLoading(false);
    };

    const handleImageLoad = () => {
      setImageLoading(false);
      setImageError(false);
    };

    const getImageSource = () => {
      if (imageError) {
        return { uri: DEFAULT_IMAGES.PRODUCT_PLACEHOLDER };
      }
      return { uri: image.uri };
    };

    return (
      <View style={styles.imageContainer}>
        <Image 
          source={getImageSource()} 
          style={styles.productImage}
          defaultSource={{ uri: DEFAULT_IMAGES.PRODUCT_PLACEHOLDER }}
          onError={handleImageError}
          onLoad={handleImageLoad}
          onLoadStart={() => setImageLoading(true)}
          resizeMode="cover"
        />
        {imageLoading && !imageError && (
          <View style={styles.imageLoadingOverlay}>
            <Text style={styles.imageLoadingText}>📷</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.removeImageButton}
          onPress={() => removeImage(index)}
        >
          <Text style={styles.removeImageText}>×</Text>
        </TouchableOpacity>
        {index === 0 && (
          <View style={styles.primaryImageBadge}>
            <Text style={styles.primaryImageText}>Main</Text>
          </View>
        )}
      </View>
    );
  };

  if (user?.user_type !== 'seller') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Only sellers can access this feature
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add New Product</Text>
          <Text style={styles.subtitle}>List a new item in your shop</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            {/* Product Images Section */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Product Images ({productImages.length}/5)</Text>
              <View style={styles.imagesContainer}>
                {productImages.map((image, index) => (
                  <ProductImagePreview key={index} image={image} index={index} />
                ))}
                
                {productImages.length < 5 && (
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={showImageOptions}
                    disabled={loading || uploadingImages}
                  >
                    <Text style={styles.addImageIcon}>📷</Text>
                    <Text style={styles.addImageText}>Add Image</Text>
                  </TouchableOpacity>
                )}
              </View>
              {productImages.length === 0 && (
                <Text style={styles.imageHint}>
                  Add at least one image to showcase your product
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Organic Red Apples"
                value={name}
                onChangeText={setName}
                maxLength={100}
                editable={!loading}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldContainer, styles.halfField]}>
                <Text style={styles.label}>Price ($) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  maxLength={10}
                  editable={!loading}
                />
              </View>

              <View style={[styles.fieldContainer, styles.halfField]}>
                <Text style={styles.label}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  maxLength={6}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Category *</Text>
              {loadingCategories ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.PRIMARY} />
                  <Text style={styles.loadingText}>Loading categories...</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScrollView}
                  contentContainerStyle={styles.categoryContainer}
                >
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        categoryId === category.id && styles.categoryButtonSelected,
                      ]}
                      onPress={() => setCategoryId(category.id)}
                      disabled={loading}
                    >
                      <Text style={styles.categoryIcon}>
                        {category.icon || getCategoryIcon(category.name)}
                      </Text>
                      <Text
                        style={[
                          styles.categoryText,
                          categoryId === category.id && styles.categoryTextSelected,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your product, its quality, origin, etc."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
                editable={!loading}
              />
              <Text style={styles.characterCount}>
                {description.length}/500 characters
              </Text>
            </View>

            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={styles.previewCard}>
                {productImages.length > 0 && (
                  <Image 
                    source={{ uri: productImages[0].uri }} 
                    style={styles.previewImage}
                    defaultSource={{ uri: DEFAULT_IMAGES.PRODUCT_PLACEHOLDER }}
                  />
                )}
                <Text style={styles.previewName}>
                  {name || 'Product name will appear here'}
                </Text>
                <Text style={styles.previewPrice}>
                  ${price || '0.00'}
                </Text>
                <Text style={styles.previewQuantity}>
                  Available: {quantity || '0'}
                </Text>
                <Text style={styles.previewCategory}>
                  Category: {getSelectedCategoryName()}
                </Text>
                <Text style={styles.previewDescription}>
                  {description || 'Product description will appear here...'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.resetButton, loading && styles.buttonDisabled]}
            onPress={resetForm}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading || loadingCategories}
          >
            {loading || uploadingImages ? (
              <View style={styles.loadingButtonContent}>
                <ActivityIndicator size="small" color={COLORS.CARD} />
                <Text style={styles.submitButtonText}>
                  {uploadingImages ? 'Uploading...' : 'Adding...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Add Product</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.CARD,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  form: {
    gap: 20,
  },
  fieldContainer: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  input: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
  },
  // Image upload styles
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.BORDER,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageLoadingText: {
    fontSize: 24,
    color: '#9ca3af',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryImageBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  primaryImageText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.CARD,
  },
  addImageIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  imageHint: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  categoryScrollView: {
    marginVertical: 8,
  },
  categoryContainer: {
    gap: 12,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    minWidth: 80,
  },
  categoryButtonSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: COLORS.CARD,
  },
  previewContainer: {
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: COLORS.BORDER,
    marginBottom: 8,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  previewPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  previewQuantity: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  previewCategory: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  previewDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.CARD,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  submitButton: {
    flex: 2,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.CARD,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});