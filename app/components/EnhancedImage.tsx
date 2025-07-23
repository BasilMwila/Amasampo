// components/EnhancedImage.tsx - Reusable image component with error handling
import { useState } from 'react';
import {
    Image,
    ImageProps,
    StyleSheet,
    Text,
    View,
    ViewStyle
} from 'react-native';
import { DEFAULT_IMAGES } from '../constants/constants';

interface EnhancedImageProps extends Omit<ImageProps, 'source'> {
  source?: { uri?: string } | number;
  fallbackSource?: { uri: string };
  containerStyle?: ViewStyle;
  loadingStyle?: ViewStyle;
  errorStyle?: ViewStyle;
  showLoadingIndicator?: boolean;
  loadingIcon?: string;
  errorIcon?: string;
  onLoadSuccess?: () => void;
  onLoadError?: (error: any) => void;
}

export default function EnhancedImage({
  source,
  fallbackSource,
  style,
  containerStyle,
  loadingStyle,
  errorStyle,
  showLoadingIndicator = true,
  loadingIcon = '📷',
  errorIcon = '🖼️',
  onLoadSuccess,
  onLoadError,
  ...props
}: EnhancedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageError = (error: any) => {
    console.log('Image failed to load:', source, error);
    setImageError(true);
    setImageLoading(false);
    onLoadError?.(error);
    
    // Auto-retry once after a short delay
    if (retryCount < 1) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageError(false);
        setImageLoading(true);
      }, 1000);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    onLoadSuccess?.();
  };

  const handleImageLoadStart = () => {
    setImageLoading(true);
    setImageError(false);
  };

  const getImageSource = () => {
    // Handle local images (require())
    if (typeof source === 'number') {
      return source;
    }

    // Handle remote images
    if (!source?.uri || imageError) {
      return fallbackSource || { uri: DEFAULT_IMAGES.PRODUCT_PLACEHOLDER };
    }

    return source;
  };

  const getFallbackSource = () => {
    return fallbackSource || { uri: DEFAULT_IMAGES.PRODUCT_PLACEHOLDER };
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        {...props}
        source={getImageSource()}
        style={[styles.image, style]}
        defaultSource={getFallbackSource()}
        onError={handleImageError}
        onLoad={handleImageLoad}
        onLoadStart={handleImageLoadStart}
        resizeMode={props.resizeMode || 'cover'}
      />
      
      {/* Loading overlay */}
      {imageLoading && showLoadingIndicator && !imageError && (
        <View style={[styles.overlay, styles.loadingOverlay, loadingStyle]}>
          <Text style={styles.loadingIcon}>{loadingIcon}</Text>
        </View>
      )}
      
      {/* Error overlay */}
      {imageError && (
        <View style={[styles.overlay, styles.errorOverlay, errorStyle]}>
          <Text style={styles.errorIcon}>{errorIcon}</Text>
          <Text style={styles.errorText}>Image not available</Text>
        </View>
      )}
    </View>
  );
}

// Specialized components for different use cases
export const ProductImage = ({ source, style, ...props }: EnhancedImageProps) => (
  <EnhancedImage
    source={source}
    fallbackSource={{ uri: DEFAULT_IMAGES.PRODUCT_PLACEHOLDER }}
    style={style}
    loadingIcon="📦"
    errorIcon="🏪"
    {...props}
  />
);

export const UserAvatar = ({ source, style, ...props }: EnhancedImageProps) => (
  <EnhancedImage
    source={source}
    fallbackSource={{ uri: DEFAULT_IMAGES.USER_AVATAR }}
    style={[styles.avatar, style]}
    loadingIcon="👤"
    errorIcon="👤"
    {...props}
  />
);

export const CategoryImage = ({ source, style, ...props }: EnhancedImageProps) => (
  <EnhancedImage
    source={source}
    fallbackSource={{ uri: DEFAULT_IMAGES.CATEGORY_PLACEHOLDER }}
    style={style}
    loadingIcon="📂"
    errorIcon="📂"
    {...props}
  />
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    backgroundColor: '#f3f4f6',
  },
  errorOverlay: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  loadingIcon: {
    fontSize: 32,
    color: '#9ca3af',
  },
  errorIcon: {
    fontSize: 24,
    color: '#9ca3af',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  avatar: {
    borderRadius: 999,
  },
});