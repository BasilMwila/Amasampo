/* eslint-disable @typescript-eslint/no-unused-vars */
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
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
interface Review {
id: number;
userId: number;
userName: string;
userAvatar?: string;
rating: number;
title: string;
comment: string;
date: string;
verified: boolean;
helpful: number;
productId?: number;
sellerId?: number;
orderNumber?: string;
images?: string[];
}
interface ReviewSummary {
averageRating: number;
totalReviews: number;
ratingDistribution: {
5: number;
4: number;
3: number;
2: number;
1: number;
};
}
const mockReviews: Review[] = [
{
id: 1,
userId: 3,
userName: 'Bob Wilson',
rating: 5,
title: 'Excellent quality apples!',
comment: 'These apples are incredibly fresh and crispy. You can tell they were just picked. The organic certification gives me confidence in the quality. Will definitely order again!',
date: '2024-01-14T10:30:00Z',
verified: true,
helpful: 12,
orderNumber: '#1003',
images: ['https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=300&h=200&fit=crop'],
},
{
id: 2,
userId: 4,
userName: 'Alice Brown',
rating: 4,
title: 'Good apples, slight bruising',
comment: 'Overall very good quality. A couple of apples had minor bruising but the taste was still excellent. Fast delivery and good packaging.',
date: '2024-01-12T15:45:00Z',
verified: true,
helpful: 8,
orderNumber: '#1001',
},
{
id: 3,
userId: 5,
userName: 'Carol Davis',
rating: 5,
title: 'Perfect for baking!',
comment: 'Used these for apple pie and they were perfect. Nice firm texture and sweet taste. The seller was also very responsive to my questions.',
date: '2024-01-10T09:20:00Z',
verified: true,
helpful: 15,
orderNumber: '#0998',
},
];
const mockSummary: ReviewSummary = {
averageRating: 4.3,
totalReviews: 45,
ratingDistribution: {
5: 23,
4: 12,
3: 7,
2: 2,
1: 1,
},
};
export default function ReviewDetailsScreen() {
const { id } = useLocalSearchParams();
const [reviews, setReviews] = useState<Review[]>(mockReviews);
const [summary] = useState<ReviewSummary>(mockSummary);
const [showWriteReview, setShowWriteReview] = useState(false);
const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'>('newest');
const [filterRating, setFilterRating] = useState<number | null>(null);
const [newReview, setNewReview] = useState({
rating: 5,
title: '',
comment: '',
});
const { user } = useAuth();
const router = useRouter();
const sortedAndFilteredReviews = React.useMemo(() => {
let filtered = [...reviews];
// Filter by rating
if (filterRating) {
  filtered = filtered.filter(review => review.rating === filterRating);
}

// Sort reviews
switch (sortBy) {
  case 'oldest':
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    break;
  case 'rating_high':
    filtered.sort((a, b) => b.rating - a.rating);
    break;
  case 'rating_low':
    filtered.sort((a, b) => a.rating - b.rating);
    break;
  case 'helpful':
    filtered.sort((a, b) => b.helpful - a.helpful);
    break;
  default: // newest
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    break;
}

return filtered;
}, [reviews, sortBy, filterRating]);
const handleWriteReview = () => {
if (!newReview.title.trim() || !newReview.comment.trim()) {
Alert.alert('Error', 'Please fill in all required fields');
return;
}
const review: Review = {
  id: Date.now(),
  userId: user?.id || 0,
  userName: user?.name || 'Anonymous',
  rating: newReview.rating,
  title: newReview.title.trim(),
  comment: newReview.comment.trim(),
  date: new Date().toISOString(),
  verified: true,
  helpful: 0,
};

setReviews([review, ...reviews]);
setNewReview({ rating: 5, title: '', comment: '' });
setShowWriteReview(false);
Alert.alert('Success', 'Your review has been posted!');
};
const handleHelpful = (reviewId: number) => {
setReviews(reviews.map(review =>
review.id === reviewId
? { ...review, helpful: review.helpful + 1 }
: review
));
};
const formatDate = (dateString: string) => {
const date = new Date(dateString);
return date.toLocaleDateString('en-US', {
year: 'numeric',
month: 'short',
day: 'numeric',
});
};
const renderStars = (rating: number, size: number = 16) => {
return (
<View style={styles.starsContainer}>
{[1, 2, 3, 4, 5].map((star) => (
<Text
key={star}
style={[
styles.star,
{ fontSize: size, color: star <= rating ? '#f59e0b' : '#e5e7eb' }
]}
>
⭐
</Text>
))}
</View>
);
};
const renderRatingBar = (rating: number, count: number, total: number) => {
const percentage = total > 0 ? (count / total) * 100 : 0;
return (
  <View style={styles.ratingBarContainer}>
    <Text style={styles.ratingBarLabel}>{rating}★</Text>
    <View style={styles.ratingBar}>
      <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
    </View>
    <Text style={styles.ratingBarCount}>{count}</Text>
  </View>
);
};
const ReviewCard = ({ review }: { review: Review }) => (
<View style={styles.reviewCard}>
<View style={styles.reviewHeader}>
<View style={styles.userInfo}>
{review.userAvatar ? (
<Image source={{ uri: review.userAvatar }} style={styles.userAvatar} />
) : (
<View style={styles.userAvatarPlaceholder}>
<Text style={styles.userAvatarText}>
{review.userName.split(' ').map(n => n[0]).join('')}
</Text>
</View>
)}
<View style={styles.userDetails}>
<View style={styles.userNameRow}>
<Text style={styles.userName}>{review.userName}</Text>
{review.verified && (
<View style={styles.verifiedBadge}>
<Text style={styles.verifiedText}>✓ Verified</Text>
</View>
)}
</View>
<Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
{review.orderNumber && (
<Text style={styles.orderNumber}>Order {review.orderNumber}</Text>
)}
</View>
</View>
<View style={styles.reviewRating}>
{renderStars(review.rating, 14)}
</View>
</View>
  <View style={styles.reviewContent}>
    <Text style={styles.reviewTitle}>{review.title}</Text>
    <Text style={styles.reviewComment}>{review.comment}</Text>
    
    {review.images && review.images.length > 0 && (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.reviewImages}
      >
        {review.images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={styles.reviewImage}
          />
        ))}
      </ScrollView>
    )}
  </View>

  <View style={styles.reviewFooter}>
    <TouchableOpacity
      style={styles.helpfulButton}
      onPress={() => handleHelpful(review.id)}
    >
      <Text style={styles.helpfulButtonText}>👍 Helpful ({review.helpful})</Text>
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
<Text style={styles.headerTitle}>Reviews</Text>
<TouchableOpacity onPress={() => setShowWriteReview(true)}>
<Text style={styles.writeReviewButton}>Write Review</Text>
</TouchableOpacity>
</View>
  <View style={styles.summarySection}>
    <View style={styles.overallRating}>
      <Text style={styles.averageRating}>{summary.averageRating.toFixed(1)}</Text>
      {renderStars(Math.round(summary.averageRating), 20)}
      <Text style={styles.totalReviews}>{summary.totalReviews} reviews</Text>
    </View>

    <View style={styles.ratingDistribution}>
      {[5, 4, 3, 2, 1].map((rating) => (
        <TouchableOpacity
          key={rating}
          onPress={() => setFilterRating(filterRating === rating ? null : rating)}
        >
          {renderRatingBar(
            rating,
            summary.ratingDistribution[rating as keyof typeof summary.ratingDistribution],
            summary.totalReviews
          )}
        </TouchableOpacity>
      ))}
    </View>
  </View>

  <View style={styles.controlsSection}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.sortContainer}
    >
      {[
        { key: 'newest', label: 'Newest' },
        { key: 'oldest', label: 'Oldest' },
        { key: 'rating_high', label: 'Highest Rated' },
        { key: 'rating_low', label: 'Lowest Rated' },
        { key: 'helpful', label: 'Most Helpful' },
      ].map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.sortButton,
            sortBy === option.key && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy(option.key as any)}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === option.key && styles.sortButtonTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>

    {filterRating && (
      <View style={styles.filterInfo}>
        <Text style={styles.filterText}>
          Showing {filterRating}-star reviews
        </Text>
        <TouchableOpacity onPress={() => setFilterRating(null)}>
          <Text style={styles.clearFilterText}>Clear filter</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>

  <FlatList
    data={sortedAndFilteredReviews}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => <ReviewCard review={item} />}
    contentContainerStyle={styles.reviewsList}
    showsVerticalScrollIndicator={false}
    ListEmptyComponent={
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>⭐</Text>
        <Text style={styles.emptyStateTitle}>No reviews yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Be the first to write a review!
        </Text>
      </View>
    }
  />

  {/* Write Review Modal */}
  <Modal
    visible={showWriteReview}
    animationType="slide"
    presentationStyle="pageSheet"
  >
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={() => setShowWriteReview(false)}>
          <Text style={styles.modalCancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Write Review</Text>
        <TouchableOpacity onPress={handleWriteReview}>
          <Text style={styles.modalSubmitButton}>Submit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent}>
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Your Rating</Text>
          <View style={styles.ratingSelector}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setNewReview({ ...newReview, rating: star })}
              >
                <Text
                  style={[
                    styles.selectableStar,
                    { color: star <= newReview.rating ? '#f59e0b' : '#e5e7eb' }
                  ]}
                >
                  ⭐
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingDescription}>
            {newReview.rating === 5 ? 'Excellent' :
             newReview.rating === 4 ? 'Good' :
             newReview.rating === 3 ? 'Average' :
             newReview.rating === 2 ? 'Poor' : 'Terrible'}
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Review Title *</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Summarize your experience..."
            value={newReview.title}
            onChangeText={(text) => setNewReview({ ...newReview, title: text })}
            maxLength={100}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Your Review *</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Tell others about your experience with this product..."
            value={newReview.comment}
            onChangeText={(text) => setNewReview({ ...newReview, comment: text })}
            multiline
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {newReview.comment.length}/500 characters
          </Text>
        </View>

        <View style={styles.guidelinesSection}>
          <Text style={styles.guidelinesTitle}>Review Guidelines</Text>
          <Text style={styles.guidelinesText}>
            • Be honest and helpful{'\n'}
            • Focus on the product and your experience{'\n'}
            • Keep it respectful and constructive{'\n'}
            • Avoid personal information
          </Text>
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
writeReviewButton: {
fontSize: 16,
color: '#3b82f6',
fontWeight: '600',
},
summarySection: {
backgroundColor: '#ffffff',
padding: 20,
borderBottomWidth: 1,
borderBottomColor: '#e5e7eb',
},
overallRating: {
alignItems: 'center',
marginBottom: 20,
},
averageRating: {
fontSize: 48,
fontWeight: 'bold',
color: '#1a1a1a',
marginBottom: 8,
},
totalReviews: {
fontSize: 16,
color: '#6b7280',
marginTop: 8,
},
ratingDistribution: {
gap: 8,
},
ratingBarContainer: {
flexDirection: 'row',
alignItems: 'center',
gap: 12,
},
ratingBarLabel: {
fontSize: 14,
color: '#374151',
width: 30,
},
ratingBar: {
flex: 1,
height: 8,
backgroundColor: '#f3f4f6',
borderRadius: 4,
overflow: 'hidden',
},
ratingBarFill: {
height: '100%',
backgroundColor: '#f59e0b',
},
ratingBarCount: {
fontSize: 14,
color: '#6b7280',
width: 30,
textAlign: 'right',
},
controlsSection: {
backgroundColor: '#ffffff',
borderBottomWidth: 1,
borderBottomColor: '#e5e7eb',
},
sortContainer: {
paddingHorizontal: 20,
paddingVertical: 12,
},
sortButton: {
paddingHorizontal: 16,
paddingVertical: 8,
borderRadius: 20,
backgroundColor: '#f3f4f6',
marginRight: 8,
},
sortButtonActive: {
backgroundColor: '#3b82f6',
},
sortButtonText: {
fontSize: 14,
color: '#6b7280',
},
sortButtonTextActive: {
color: '#ffffff',
},
filterInfo: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
paddingHorizontal: 20,
paddingBottom: 12,
},
filterText: {
fontSize: 14,
color: '#374151',
},
clearFilterText: {
fontSize: 14,
color: '#3b82f6',
},
reviewsList: {
padding: 16,
},
reviewCard: {
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
reviewHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
marginBottom: 12,
},
userInfo: {
flexDirection: 'row',
flex: 1,
},
userAvatar: {
width: 40,
height: 40,
borderRadius: 20,
marginRight: 12,
},
userAvatarPlaceholder: {
width: 40,
height: 40,
borderRadius: 20,
backgroundColor: '#3b82f6',
alignItems: 'center',
justifyContent: 'center',
marginRight: 12,
},
userAvatarText: {
color: '#ffffff',
fontSize: 14,
fontWeight: '600',
},
userDetails: {
flex: 1,
},
userNameRow: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 2,
},
userName: {
fontSize: 16,
fontWeight: '600',
color: '#1a1a1a',
marginRight: 8,
},
verifiedBadge: {
backgroundColor: '#10b981',
paddingHorizontal: 6,
paddingVertical: 2,
borderRadius: 4,
},
verifiedText: {
fontSize: 10,
color: '#ffffff',
fontWeight: '600',
},
reviewDate: {
fontSize: 12,
color: '#6b7280',
},
orderNumber: {
fontSize: 12,
color: '#3b82f6',
},
reviewRating: {
alignItems: 'flex-end',
},
starsContainer: {
flexDirection: 'row',
},
star: {
marginRight: 2,
},
reviewContent: {
marginBottom: 12,
},
reviewTitle: {
fontSize: 16,
fontWeight: '600',
color: '#1a1a1a',
marginBottom: 8,
},
reviewComment: {
fontSize: 14,
color: '#374151',
lineHeight: 20,
marginBottom: 12,
},
reviewImages: {
flexDirection: 'row',
marginBottom: 8,
},
reviewImage: {
width: 80,
height: 80,
borderRadius: 8,
marginRight: 8,
},
reviewFooter: {
flexDirection: 'row',
justifyContent: 'flex-end',
},
helpfulButton: {
paddingHorizontal: 12,
paddingVertical: 6,
backgroundColor: '#f3f4f6',
borderRadius: 6,
},
helpfulButtonText: {
fontSize: 12,
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
modalSubmitButton: {
fontSize: 16,
color: '#3b82f6',
fontWeight: '600',
},
modalContent: {
flex: 1,
padding: 20,
},
ratingSection: {
alignItems: 'center',
marginBottom: 24,
},
ratingLabel: {
fontSize: 18,
fontWeight: '600',
color: '#1a1a1a',
marginBottom: 12,
},
ratingSelector: {
flexDirection: 'row',
gap: 8,
marginBottom: 8,
},
selectableStar: {
fontSize: 32,
},
ratingDescription: {
fontSize: 16,
color: '#6b7280',
},
inputSection: {
marginBottom: 20,
},
inputLabel: {
fontSize: 16,
fontWeight: '600',
color: '#374151',
marginBottom: 8,
},
titleInput: {
backgroundColor: '#ffffff',
borderWidth: 1,
borderColor: '#e5e7eb',
borderRadius: 8,
paddingHorizontal: 16,
paddingVertical: 12,
fontSize: 16,
},
commentInput: {
backgroundColor: '#ffffff',
borderWidth: 1,
borderColor: '#e5e7eb',
borderRadius: 8,
paddingHorizontal: 16,
paddingVertical: 12,
fontSize: 16,
height: 120,
textAlignVertical: 'top',
},
characterCount: {
fontSize: 12,
color: '#6b7280',
textAlign: 'right',
marginTop: 4,
},
guidelinesSection: {
backgroundColor: '#f0f9ff',
borderRadius: 8,
padding: 16,
marginTop: 20,
},
guidelinesTitle: {
fontSize: 16,
fontWeight: '600',
color: '#1e40af',
marginBottom: 8,
},
guidelinesText: {
fontSize: 14,
color: '#1e40af',
lineHeight: 20,
},
});