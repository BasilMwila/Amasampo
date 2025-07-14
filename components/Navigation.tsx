import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface NavigationHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightElement,
  backgroundColor = '#ffffff',
  textColor = '#1a1a1a',
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.headerContent}>
        {showBackButton ? (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Text style={[styles.backButtonText, { color: textColor }]}>
              ← Back
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        
        <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>
        
        {rightElement ? (
          <View style={styles.rightElement}>
            {rightElement}
          </View>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </View>
  );
};

interface TabBarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
  userType?: 'buyer' | 'seller';
}

export const CustomTabBar: React.FC<TabBarProps> = ({
  currentRoute,
  onRouteChange,
  userType = 'buyer',
}) => {
  const tabs = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'messages', label: 'Messages', icon: '💬' },
    ...(userType === 'seller' ? [{ key: 'add-product', label: 'Add Product', icon: '➕' }] : []),
    { key: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <SafeAreaView style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem,
              currentRoute === tab.key && styles.tabItemActive,
            ]}
            onPress={() => onRouteChange(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                currentRoute === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

interface BottomActionBarProps {
  primaryAction?: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
  };
  backgroundColor?: string;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  primaryAction,
  secondaryAction,
  backgroundColor = '#ffffff',
}) => {
  return (
    <SafeAreaView style={[styles.bottomActionContainer, { backgroundColor }]}>
      <View style={styles.bottomActionBar}>
        {secondaryAction && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryActionButton,
              secondaryAction.disabled && styles.actionButtonDisabled,
            ]}
            onPress={secondaryAction.onPress}
            disabled={secondaryAction.disabled}
          >
            <Text style={[
              styles.actionButtonText,
              styles.secondaryActionButtonText,
              secondaryAction.disabled && styles.actionButtonTextDisabled,
            ]}>
              {secondaryAction.label}
            </Text>
          </TouchableOpacity>
        )}
        
        {primaryAction && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryActionButton,
              primaryAction.disabled && styles.actionButtonDisabled,
              !secondaryAction && styles.fullWidthButton,
            ]}
            onPress={primaryAction.onPress}
            disabled={primaryAction.disabled}
          >
            <Text style={[
              styles.actionButtonText,
              styles.primaryActionButtonText,
              primaryAction.disabled && styles.actionButtonTextDisabled,
            ]}>
              {primaryAction.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  showFilter?: boolean;
  onFilterPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onSubmit,
  showFilter = false,
  onFilterPress,
}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text
          style={styles.searchInput}
          // value={value}
          // onChangeText={onChangeText}
          // placeholder={placeholder}
          // returnKeyType="search"
          // onSubmitEditing={onSubmit}
        >
          {value || placeholder}
        </Text>
      </View>
      {showFilter && (
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Header styles
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  rightElement: {
    alignItems: 'flex-end',
  },
  spacer: {
    width: 60,
  },

  // Tab bar styles
  tabBarContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabItemActive: {
    // Active state styling handled by text/icon colors
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },

  // Bottom action bar styles
  bottomActionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bottomActionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  fullWidthButton: {
    flex: 1,
  },
  primaryActionButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryActionButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryActionButtonText: {
    color: '#ffffff',
  },
  secondaryActionButtonText: {
    color: '#374151',
  },
  actionButtonTextDisabled: {
    color: '#9ca3af',
  },

  // Search bar styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 18,
  },
});