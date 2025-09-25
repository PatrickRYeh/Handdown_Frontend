/**
 * Your_Listings Screen
 *
 * Displays user's personal listings with real API data.
 * Shows listing items with images, titles, price, and date created.
 * Matches the design with back navigation and clean list layout.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';

// Interface for listing data structure (matching the API response)
interface Listing {
  id: string;
  price: string;
  title: string;
  thumbnail_url: string;
  offering_uid: string;
  description: string;
  listing_type_id: number;
  time_updated: string;
  time_created: string;
  region_id: number;
  condition: string;
  listing_images: { position: number; image_url: string }[] | null;
  tags: { tag_name: string }[] | null;
}

// interface for the listing items, currently has no interactivity
interface ListingItemProps {
  listing: Listing;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ListingItem: React.FC<ListingItemProps> = ({ listing, onPress, onEdit, onDelete }) => {
  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Pressable style={styles.listingItem} onPress={onPress}>
      <View style={styles.listingContent}>
        {/* Display listing image or placeholder */}
        {listing.thumbnail_url ? (
          <Image 
            source={{ uri: listing.thumbnail_url }} 
            style={styles.listingImage}
            resizeMode="cover"
          />
          // else, show a placeholder
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        
        {/* Display listing info */}
        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle}>{listing.title}</Text>
          <Text style={styles.listingSubtitle}>
            {listing.price} - {formatDate(listing.time_created)}
          </Text>
          <Text style={styles.conditionText}>Condition: {listing.condition}</Text>
        </View>

        {/* Action icons on the right */}
        <View style={styles.actionIcons}>
          <Pressable style={styles.iconButton} onPress={onEdit}>
            <MaterialCommunityIcons name="pencil" size={20} color="#666" />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={onDelete}>
            <MaterialCommunityIcons name="trash-can" size={20} color="#666" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

export default function YourListingsScreen() {
  const router = useRouter();
  
  // State management for listings data
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);

  // Constants for API call will change later to be dynamic and get from cache
  const profileId = "51e242d0-e313-47f8-a881-27bba664a57b";
  const schemaName = "ucberkeley";

  // API call function to fetch profile listings
  const fetchProfileListings = async () => {
    if (loading) return; // Prevent duplicate requests
    
    // sets loading to be true so that can display when loading
    setLoading(true);
    try {
      const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${backendUrl}/profile-page/get-profile-listings/${profileId}?schema_name=${schemaName}`,
        { headers: { Accept: 'application/json' } }
      );
      
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const result = await response.json();
      
      // Destructure the response as specified
      const { message, listings: apiListings, count: listingCount } = result;
      
      // Transform API data to match our Listing interface
      const mappedListings: Listing[] = (apiListings ?? []).map((item: any) => {
        // Sort images by position and get the first one for thumbnail
        const sortedImages = item.listing_images 
          ? [...item.listing_images].sort((a: any, b: any) => a.position - b.position)
          : null;
        
        const thumbnailUrl = sortedImages && sortedImages.length > 0 
          ? sortedImages[0].image_url 
          : '';

        return {
          id: item.listing_id,
          price: item.price ? `$${String(item.price)}` : 'Price not set',
          title: item.title,
          thumbnail_url: thumbnailUrl,
          description: item.description ?? '',
          listing_type_id: item.listing_type_id,
          time_updated: item.time_updated,
          time_created: item.time_created,
          region_id: item.region_id,
          condition: item.condition,
          listing_images: item.listing_images,
          offering_uid: item.offering_uid,
          tags: item.tags,
        };
      });
      
      setListings(mappedListings);
      setCount(listingCount);
      
    } catch (err) {
      console.error('Error fetching profile listings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load listings when component mounts
  useEffect(() => {
    fetchProfileListings();
  }, []);

  const handleListingPress = (listingId: string) => {
    // TODO: Navigate to individual listing detail page
    console.log('Listing pressed:', listingId);
  };

  const handleEditListing = (listing: Listing) => {
    router.push({
      pathname: '/update_listing',
      params: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price.replace('$', ''), // Remove $ sign for editing
        condition: listing.condition,
        listing_type_id: listing.listing_type_id.toString(),
        thumbnail_url: listing.thumbnail_url,
        time_created: listing.time_created,
        time_updated: listing.time_updated,
        region_id: listing.region_id.toString(),
        offering_uid: listing.offering_uid,
        listing_images: listing.listing_images ? JSON.stringify(listing.listing_images) : null,
        tags: listing.tags ? JSON.stringify(listing.tags) : null,
      }
    });
  };

  const handleDeleteListing = (listingId: string) => {
    // TODO: Show delete confirmation dialog
    console.log('Delete listing:', listingId);
  };

  return (
    <>
      {/* Top app bar with back navigation */}
      <Stack.Screen
        options={{
          title: '',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor="#666"
              onPress={() => router.back()}
            />
          ),
        }}
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Show loading message */}
          {loading && listings.length === 0 && (
            <Text style={styles.loadingText}>Loading your listings...</Text>
          )}
          
          {/* Show empty state when no listings */}
          {!loading && listings.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No listings found</Text>
              <Text style={styles.emptyStateSubtext}>
                You haven't created any listings yet.
              </Text>
            </View>
          )}
          
          {/* Show listings count */}
          {listings.length > 0 && (
            <Text style={styles.countText}>
              {count} listing{count !== 1 ? 's' : ''} found
            </Text>
          )}
          
          {/* Render actual listings */}
          {listings.map((listing) => (
            <ListingItem
              key={listing.id}
              listing={listing}
              onPress={() => handleListingPress(listing.id)}
              onEdit={() => handleEditListing(listing)}
              onDelete={() => handleDeleteListing(listing.id)}
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  countText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontWeight: '500',
  },
  listingItem: {
    marginBottom: 24,
  },
  listingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8E8E8',
    marginRight: 16,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  listingSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  conditionText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
});
