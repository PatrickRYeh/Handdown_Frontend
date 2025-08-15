/**
 * LandingScreen (Home)
 *
 * Presents a 2-column grid of listings with a top app bar for quick actions
 * (filter, sell, search, account). Navigation routes exist for listing details
 * and creating a new listing. Data and images are currently mocked.
 */
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Appbar, Button, Card, Chip, IconButton, useTheme } from 'react-native-paper';

/**
 * Canonical shape of a listing item. Replace or extend as API evolves.
 */
interface Listing {
  id: string;
  price: string;
  title: string;
  thumbnail_url: string;
  // not used in main screen
  offering_uid: string;
  description: string;
  listing_type_id: number;
  time_updated: string;
  region_id: number;
  condition: string;
  other_images: string[] | null;
}

// Layout constants used to size cards responsively across device widths
const { width: WINDOW_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (WINDOW_WIDTH - CARD_MARGIN * 4) / 2;

interface ListingCardProps {
  price: string;
  title: string;
  imageUrl: string | null;
  onPress: () => void;
}

/**
 * ListingCard
 *
 * Displays a single listing card. Uses the real image if provided,
 * otherwise shows a placeholder.
 */
const ListingCard: React.FC<ListingCardProps> = ({ price, title, imageUrl, onPress }) => {
  const theme = useTheme();
  
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.imagePlaceholder}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primary }]} />
        )}
        <Card.Content style={styles.cardContent}>
          <Text style={styles.priceText}>{price}</Text>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        </Card.Content>
      </Card>
    </Pressable>
  );
};

export default function LandingScreen() {
  // State to hold fetched listings (from API)
  const [listings, setListings] = useState<Listing[]>([]);

  // Query parameters for backend
  // TODO -- grab schema_name from cache
  // Auto store -- last time (for batches)
  // Build query -- add filters to window 
  const query = {
    schema_name: "ucberkeley",
    last_time: "2025-07-28T15:00:00Z",
    limit: 6,
    filters: {}
  };

  // Encode query as a URL parameter
  const queryStr = encodeURIComponent(JSON.stringify(query));

  // Fetch listings (calling the API endpoint here)
  useEffect(() => {
    const fetchListings = async () => {
      try {
        // TODO -- make this environment var (do ifconfig and find en0 ip address)
        const backendUrl = "http://192.168.6.172:8000";
        const res = await fetch(
          `${backendUrl}/listings/get-batch-listings-by-recency?listing_query_str=${queryStr}`,
          { headers: { Accept: 'application/json' } }
        );
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        console.log("API response:", data.message);

        interface ApiListing {
          listing_id: string;
          offering_uid: string;
          listing_type_id: number;
          title: string;
          description: string;
          price: number;
          time_created: string;
          time_updated: string;
          region_id: number;
          condition: string;
          thumbnail_url: string | null;
          other_images: string[] | null;
        }

        const mappedListings: Listing[] = (data.listings ?? []).map((item: ApiListing) => ({
          id: item.listing_id,
          price: `$${String(item.price)}`,
          title: item.title,
          thumbnail_url: item.thumbnail_url,
          description: item.description ?? '',
          listing_type_id: item.listing_type_id,
          time_updated: item.time_updated,
          region_id: item.region_id,
          condition: item.condition,
          other_images: item.other_images ?? null,
          offering_uid: item.offering_uid,
        }));

        setListings(mappedListings);
      } catch (err) {
        console.error(err);
      }
    };

    fetchListings();
  }, []);

  const handleFilterPress = useCallback(() => {}, []);
  
  const handleListingPress = useCallback((listing: Listing) => {
    router.push({
      pathname: '/[id]',
      params: {
        id: listing.id,
        price: listing.price,
        title: listing.title,
        imageUrl: listing.thumbnail_url,
      },
    });
  }, []);

  const handleSellPress = useCallback(() => {
    router.push('/create_listing');
  }, []);

  const renderItem = useCallback(({ item }: { item: Listing }) => (
    <ListingCard
      price={item.price}
      title={item.title}
      imageUrl={item.thumbnail_url}
      onPress={() => handleListingPress(item)}
    />
  ), [handleListingPress]);

  const keyExtractor = useCallback((item: Listing) => item.id, []);

  return (
    <View style={styles.container}>
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
  // Secondary, truncated title
  titleText: {
    fontSize: 14,
    color: '#666',
  },
});
