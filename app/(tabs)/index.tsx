/**
 * LandingScreen (Home)
 *
 * Presents a 2-column grid of listings with a top app bar for quick actions
 * (filter, sell, search, account). Navigation routes exist for listing details
 * and creating a new listing. Data and images are currently mocked.
 */
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Appbar, Button, Card, Chip, IconButton, useTheme } from 'react-native-paper';

/**
 * Canonical shape of a listing item. Replace or extend as API evolves.
 */
interface Listing {
  id: string;
  price: string;
  description: string;
  imageUrl: string | null;
}

// Mocked listings for development. Swap with API-backed data source.
const listings: Listing[] = [
  { id: '1', price: '$30', description: 'Pickup by Friday', imageUrl: null },
  { id: '2', price: '$45', description: 'Pickup ASAP', imageUrl: null },
  { id: '3', price: '$20', description: 'Pickup by Fart', imageUrl: null },
  { id: '4', price: '$15', description: 'Pickup Today', imageUrl: null },
  { id: '5', price: '$50', description: 'Pickup Weekend', imageUrl: null },
  { id: '6', price: '$40', description: 'Pickup by Tuesday', imageUrl: null },
];

// Layout constants used to size cards responsively across device widths
const { width: WINDOW_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (WINDOW_WIDTH - CARD_MARGIN * 4) / 2;

interface ListingCardProps {
  price: string;
  description: string;
  imageUrl: string | null;
  onPress: () => void;
}

/**
 * ListingCard
 *
 * Presentational component that displays a single listing card with a
 * placeholder image area, price, and truncated description. Click/press events
 * are delegated to the parent through `onPress`.
 */
const ListingCard: React.FC<ListingCardProps> = ({ price, description, imageUrl, onPress }) => {
  const theme = useTheme();
  
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        {/* Image placeholder — replace with <Image/> when imageUrl is wired up */}
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primary }]} />
        <Card.Content style={styles.cardContent}>
          <Text style={styles.priceText}>{price}</Text>
          <Text style={styles.descriptionText} numberOfLines={1}>
            {description}
          </Text>
        </Card.Content>
      </Card>
    </Pressable>
  );
};

export default function LandingScreen() {
  // Filter trigger — will open filter UI (e.g., campus circle). No-op for now.
  const handleFilterPress = useCallback(() => {}, []);
  
  // Navigate to the details screen for the tapped listing, passing params
  const handleListingPress = useCallback((listing: Listing) => {
    router.push({
      pathname: '/[id]',
      params: {
        id: listing.id,
        price: listing.price,
        description: listing.description,
        imageUrl: listing.imageUrl,
      },
    });
  }, []);

  // Navigate to the create-listing flow
  const handleSellPress = useCallback(() => {
    router.push('/create_listing');
  }, []);

  // FlatList item renderer — memoized for performance
  const renderItem = useCallback(({ item }: { item: Listing }) => (
    <ListingCard
      price={item.price}
      description={item.description}
      imageUrl={item.imageUrl}
      onPress={() => handleListingPress(item)}
    />
  ), [handleListingPress]);

  // Stable key extractor for FlatList
  const keyExtractor = useCallback((item: Listing) => item.id, []);

  return (
    <View style={styles.container}>
      {/* Top App Bar: filter chip, Sell action, search, and account */}
      <Appbar.Header style={styles.header}>
        <View style={styles.headerLeft}>
          <Chip
            mode="outlined"
            onPress={handleFilterPress}
            style={styles.filterChip}>
            Campus Circle
          </Chip>
          <Button
            mode="contained"
            onPress={handleSellPress}
            style={styles.sellButton}
            labelStyle={styles.sellButtonLabel}
            buttonColor="#6222B1">
            Sell
          </Button>
        </View>
        <View style={styles.headerRight}>
          <IconButton icon="magnify" size={24} onPress={() => {}} />
          <IconButton icon="account-circle-outline" size={24} onPress={() => {}} />
        </View>
      </Appbar.Header>

      {/* Listings Grid: 2-column masonry-like layout */}
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Screen root
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // App bar styling
  header: {
    backgroundColor: '#fff',
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    justifyContent: 'space-between',
  },
  // Left side of header: filter chip + sell button
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Right side of header: icon actions
  headerRight: {
    flexDirection: 'row',
  },
  // Filter chip spacing
  filterChip: {
    marginLeft: 8,
  },
  // Primary CTA button in the header
  sellButton: {
    marginLeft: 8,
    borderRadius: 20,
  },
  // Contrasting label for the Sell button
  sellButtonLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Padded content around the list
  listContainer: {
    padding: CARD_MARGIN,
  },
  // Distributes two cards per row evenly
  columnWrapper: {
    justifyContent: 'space-between',
  },
  // Card sizing to fit two columns with margins
  card: {
    width: CARD_WIDTH,
    marginBottom: CARD_MARGIN * 2,
  },
  // Placeholder block where listing image will render
  imagePlaceholder: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  // Card inner padding
  cardContent: {
    padding: 8,
  },
  // Price emphasis
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  // Secondary, truncated description
  descriptionText: {
    fontSize: 14,
    color: '#666',
  },
});
