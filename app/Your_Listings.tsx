/**
 * Your_Listings Screen
 *
 * Displays user's personal listings with placeholder data.
 * Shows listing items with circular placeholders, titles, price, and date created.
 * Matches the design with back navigation and clean list layout.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';

// Placeholder data for user's listings
const PLACEHOLDER_LISTINGS = [
  {
    id: '1',
    title: 'Listing 1',
    price: '$25',
    dateCreated: 'Date Created'
  },
  {
    id: '2', 
    title: 'Listing 2',
    price: '$40',
    dateCreated: 'Date Created'
  },
  {
    id: '3',
    title: 'Listing 3', 
    price: '$15',
    dateCreated: 'Date Created'
  }
];

interface ListingItemProps {
  title: string;
  price: string;
  dateCreated: string;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ListingItem: React.FC<ListingItemProps> = ({ title, price, dateCreated, onPress, onEdit, onDelete }) => (
  <Pressable style={styles.listingItem} onPress={onPress}>
    <View style={styles.listingContent}>
      {/* Circular placeholder for listing image */}
      <View style={styles.imagePlaceholder} />
      
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle}>{title}</Text>
        <Text style={styles.listingSubtitle}>{price} - {dateCreated}</Text>
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

export default function YourListingsScreen() {
  const router = useRouter();

  const handleListingPress = (listingId: string) => {
    // TODO: Navigate to individual listing detail page
    console.log('Listing pressed:', listingId);
  };

  const handleEditListing = (listingId: string) => {
    router.push({
      pathname: '/update_listing',
      params: { id: listingId }
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
          {PLACEHOLDER_LISTINGS.map((listing) => (
            <ListingItem
              key={listing.id}
              title={listing.title}
              price={listing.price}
              dateCreated={listing.dateCreated}
              onPress={() => handleListingPress(listing.id)}
              onEdit={() => handleEditListing(listing.id)}
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
  listingItem: {
    marginBottom: 24,
  },
  listingContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
