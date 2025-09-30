/**
 * ListingDetailScreen
 *
 * Displays a single listing's details including a (placeholder) image carousel,
 * price/description, quick actions (message, bid, save, share), and a seller
 * info card with a map placeholder. Navigation params provide the listing's
 * id, price, and description. Image data and chat backend are stubbed.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { IconButton, Surface, useTheme } from 'react-native-paper';

// Viewport width used to size the full-bleed carousel slides
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Placeholder for image items — replace with real URIs once backend integration is ready
const PLACEHOLDER_IMAGES = Array(4).fill(null);

/**
 * Route params expected for this screen. Extend when image collection is added.
 */
interface ListingDetailParams {
  id: string;
  price: string;
  title: string;
  description: string;
  listing_type_id: string; // comes as string from URL params
  time_updated: string;
  region_id: string; // comes as string from URL params
  condition: string;
  offering_uid: string;
  listing_images: string; // JSON string of image array or null
}

/**
 * Profile data structure returned from the backend API
 * Represents a user's profile information including personal details,
 * university info, and location data
 */
interface ProfileData {
  uid: string;
  email: string;
  fname: string;
  lname: string;
  profile_pic_url: string;
  university_student_id: string;
  role_id: number;
  campus_region: {
    region_name: string;
  };
  class_year: {
    class_year: string;
  };
}

/**
 * API response structure for profile endpoint
 * Contains the profile data array and success message
 * Matches the new structure provided by the backend
 */
interface ProfileApiResponse {
  message: string;
  data: Array<{
    uid: string;
    email: string;
    fname: string;
    lname: string;
    profile_pic_url: string;
    university_student_id: string;
    role_id: number;
    campus_region: {
      region_name: string;
    };
    class_year: {
      class_year: string;
    };
  }>;
  count: number;
}

export default function ListingDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  // Listing data provided via route params
  const params = useLocalSearchParams();

  // Destructure the params object to get the individual properties
  const {
    id,
    price,
    title,
    description,
    listing_type_id,
    time_updated,
    region_id,
    condition,
    offering_uid,
    listing_images
  } = params;
  // Index of the currently visible carousel slide

  const listingTypeId = listing_type_id ? parseInt(listing_type_id as string) : 0;
  const regionId = region_id ? parseInt(region_id as string) : 0;
  
  // Parse listing_images from JSON string to array of image objects
  const listingImagesArray: { position: number; image_url: string }[] | null = 
    listing_images && listing_images !== 'null' 
      ? JSON.parse(listing_images as string) 
      : null;


  // Create the carousel data using listing_images sorted by position
  const createCarouselData = () => {
    if (listingImagesArray && listingImagesArray.length > 0) {
      // Sort images by position and extract just the URLs
      const sortedImages = [...listingImagesArray]
        .sort((a, b) => a.position - b.position)
        .map(img => img.image_url);
      
      return sortedImages;
    }
    
    // If we have no real images, use placeholders
    return PLACEHOLDER_IMAGES;
  };

  const carouselData = createCarouselData();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // Controlled value for the message composer
  const [message, setMessage] = useState("Still selling? I'm interested :)");
  // Ref to the horizontal FlatList (carousel)
  const flatListRef = useRef<FlatList>(null);

  // Profile data state management
  // Stores the seller's profile information fetched from the backend
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  // Loading state to show spinner/placeholder while fetching profile data
  const [profileLoading, setProfileLoading] = useState(false);
  // Error state to handle and display API errors
  const [profileError, setProfileError] = useState<string | null>(null);

  /**
   * Fetches profile data from the backend API for the listing's seller
   * Uses the offering_uid from the listing params to get the correct seller's profile
   * Follows the same pattern as Your_Listings.tsx for API endpoint structure
   * 
   * @param profileId - The unique identifier for the user profile (uses offering_uid from listing)
   * @param schemaName - The database schema name (defaults to "ucberkeley")
   */
  const fetchProfile = async (
    profileId: string,
    schemaName: string = "ucberkeley"
  ) => {
    // Prevent duplicate requests if already loading
    if (profileLoading) return;
    
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      // Get the backend URL from environment variables (same as index.tsx pattern)
      const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      
      // Construct the API endpoint URL with correct structure: /profile-page/{profile_id}?schema_name={schema_name}
      const apiUrl = `${backendUrl}/profile-page/${profileId}?schema_name=${schemaName}`;
      
      // Make the API request with proper headers
      const response = await fetch(apiUrl, {
        headers: { 
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: Failed to fetch profile`);
      }
      
      // Destructure the new response structure
      const { message, data, count }: ProfileApiResponse = await response.json();
      const profile = data[0]; // Profile data is in an array
      
      // Extract the first profile from the response array
      // The API returns an array, but we expect only one profile
      if (data && data.length > 0) {
        setProfileData(profile);
      } else {
        throw new Error('No profile data found in response');
      }
      
    } catch (error) {
      // Handle any errors that occurred during the fetch
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setProfileError(errorMessage);
      console.error('Error fetching profile:', errorMessage);
    } finally {
      // Always set loading to false when request completes
      setProfileLoading(false);
    }
  };

  /**
   * Effect hook to fetch profile data immediately when component mounts
   * Runs when the component is first rendered and when offering_uid changes
   * Uses the offering_uid from the listing params to get the seller's profile
   */
  useEffect(() => {
    // Only fetch profile if offering_uid is available
    if (offering_uid && typeof offering_uid === 'string') {
      fetchProfile(offering_uid);
    } else {
      // Set error state if offering_uid is missing
      setProfileError('No seller ID available for this listing');
      console.warn('offering_uid is missing or invalid:', offering_uid);
    }
  }, [offering_uid]); // Re-run if offering_uid changes

  // Send composed message — wire up to chat backend later
  const handleSend = () => {
    // TODO: Implement chat backend integration
    setMessage('');
  };

  // Renders a single image slide - real images or placeholder
  const renderImageItem = ({ item }: { item: string | null }) => {
    if (item) {
      // Render real image from URL
      return (
        <Image
          source={{ uri: item }}
          style={styles.imagePlaceholder}
          resizeMode="cover"
        />
      );
    } else {
      // Render placeholder if no image URL
      return (
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primary }]} />
      );
    }
  };

  // Updates activeImageIndex based on horizontal scroll position
  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    // Round to nearest integer and clamp via modulo to avoid overflow
    const roundIndex = Math.round(index);
    setActiveImageIndex(roundIndex % carouselData.length);
  };

  return (
    <>
      {/* Top app bar: back, search, and account actions */}
      <Stack.Screen
        options={{
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => router.back()}
            />
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <IconButton icon="magnify" size={24} />
              <IconButton icon="account-circle-outline" size={24} />
            </View>
          ),
        }}
      />
      {/* Scrollable content wrapper for the listing details */}
      <ScrollView style={styles.container}>
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={carouselData}
            renderItem={renderImageItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
          {/* Pagination indicators tied to activeImageIndex - corresponds to actual images */}
          <View style={styles.paginationDots}>
            {carouselData.map((_, index) => (
              <View
                key={`${id}-image-${index}`}
                style={[
                  styles.dot,
                  { backgroundColor: index === activeImageIndex ? '#fff' : 'rgba(255,255,255,0.5)' }
                ]}
              />
            ))}
          </View>
        </View>
        {/* Primary listing information */}
        <View style={styles.contentContainer}>
          <Text style={styles.price}>{params.price}</Text>
          <Text style={styles.title}>{params.title}</Text>
          <Text style={styles.description}>{params.description}</Text>
        </View>
        {/* Interaction bar: message composer and quick actions */}
        <Surface style={styles.interactionBar} elevation={1}>
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              value={message}
              // Initialize with a friendly default message
              onChangeText={setMessage}
              placeholder="Type a message..."
            />
            {/* Send message */}
            <IconButton icon="send" size={24} onPress={handleSend} />
          </View>
          {/* Quick action buttons: Bid, Save, Share */}
          <View style={styles.actionButtons}>
            {[
              { icon: 'currency-usd', label: 'Bid' },
              { icon: 'bookmark-outline', label: 'Save' },
              { icon: 'share-variant', label: 'Share' }
            ].map((action, index) => (
              <View key={index} style={styles.actionButton}>
                <IconButton icon={action.icon} size={24} />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </View>
            ))}
          </View>
        </Surface>
        {/* Seller card with map placeholder and dynamic seller info */}
        <Surface style={styles.sellerCard} elevation={1}>
          <View style={styles.mapContainer}>
            {/* Profile picture or map placeholder */}
            {profileData?.profile_pic_url ? (
              <Image
                source={{ uri: profileData.profile_pic_url }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.mapPlaceholder}>
                <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.primary} />
              </View>
            )}
          </View>
          <View style={styles.sellerInfo}>
            {/* Display seller name from profile data or loading/error state */}
            {profileLoading ? (
              <Text style={styles.sellerName}>Loading profile...</Text>
            ) : profileError ? (
              <Text style={styles.sellerName}>Error loading profile</Text>
            ) : profileData ? (
              <>
                {/* Full name from profile data */}
                <Text style={styles.sellerName}>
                  {profileData.fname} {profileData.lname}
                </Text>
                {/* Class year and role information */}
                <Text style={styles.sellerDetail}>
                  {profileData.class_year?.class_year || 'Student'} • Role ID: {profileData.role_id}
                </Text>
                {/* Placeholder rating - TODO: implement actual rating system */}
                <Text style={styles.sellerRating}>⭐⭐⭐⭐</Text>
                {/* Campus region from profile data */}
                <Text style={styles.location}>
                  {profileData.campus_region?.region_name || 'Campus Location'}
                </Text>
              </>
            ) : (
              <>
                {/* Loading state while profile data is being fetched */}
                <Text style={styles.sellerName}>Loading seller info...</Text>
                <Text style={styles.sellerDetail}>Fetching profile data...</Text>
                <Text style={styles.sellerRating}>⭐⭐⭐⭐</Text>
                <Text style={styles.location}>Campus Location</Text>
              </>
            )}
          </View>
        </Surface>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  // Screen root
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Right side of header with action icons
  headerRight: {
    flexDirection: 'row',
  },
  // Carousel wrapper with fixed height
  carouselContainer: {
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  // Full-width slide placeholder
  imagePlaceholder: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  // Row of pagination dots overlaying the carousel
  paginationDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  // Single pagination dot
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  // Spacing for content below the carousel
  contentContainer: {
    padding: 16,
  },
  // Prominent price text
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  // Listing title text
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  // Secondary description text
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  // Container for message composer and actions
  interactionBar: {
    padding: 16,
    backgroundColor: '#F3F0FF',
    marginTop: 8,
  },
  // Message input area styling
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingLeft: 16,
  },
  // Text input grows to fill remaining space
  messageInput: {
    flex: 1,
    height: 40,
  },
  // Quick actions layout
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  // Individual quick action wrapper
  actionButton: {
    alignItems: 'center',
  },
  // Label under each quick action icon
  actionLabel: {
    fontSize: 12,
    marginTop: -8,
  },
  // Seller card container
  sellerCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
  },
  // Map placeholder wrapper on the left
  mapContainer: {
    width: 100,
    marginRight: 16,
  },
  // Map placeholder styling
  mapPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Profile image styling - matches map placeholder dimensions
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  // Seller info column on the right
  sellerInfo: {
    flex: 1,
  },
  // Seller name emphasis
  sellerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  // Light detail text under seller name
  sellerDetail: {
    color: '#666',
    marginBottom: 4,
  },
  // Simple star rating text
  sellerRating: {
    marginBottom: 4,
  },
  // Subtle location text
  location: {
    color: '#666',
  },
}); 