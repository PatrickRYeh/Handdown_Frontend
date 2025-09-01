/**
 * LandingScreen (Home)
 *
 * Presents a 2-column grid of listings with a top app bar for quick actions
 * (filter, sell, search, account). Navigation routes exist for listing details
 * and creating a new listing. Data and images are currently mocked.
 */
// Router is necessary to navigate between screens in app
import { router } from 'expo-router';
// import some special hooks along with React to superpower 
// useCallback: helps app run faster by remembering functions, like memorizing a math formula so not have rederive it every time
// useEffect: a component that a tool that lets you do thing when your compnent loads or changes, for actions like "fetch data when the page loads", sets up automatic tasks that happen at speciic times
// useState: a hook that lets you track and update a values in your component, for storing data that can change (like user input, loading states, etc)
import React, { useCallback, useEffect, useState } from 'react';
// Dimensions: tool to get screen size information, to make app look good on different devices
// FlatList: a component for displaying scrollable lists
// Image: component for displaying pictures 
// Pressable: component that responds to clicks/touches 
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
//Appbar: A ready-made top navigation bar, not need to rebuild 
// Button: a  pre-styled button component
// Card: a container with nice borders and shadows, like a playing card. Good for displaing in organized, appealing blocks
// Chip: for small pill-shaped components (lkke tabs or labels)
// IconButton: a button that shows just an icon
// useTheme: a hook/tool that gives access to the app's color scheme and styling, helps maintain consistent colors and styling
import { Appbar, Button, Card, Chip, IconButton, useTheme } from 'react-native-paper';

/**
 * Interface (in Typescript): creates a blueprint/template -> every time someone creates a listing, it MUST have these eact pieces of information
 */
interface Listing {
  id: string;
  price: string;
  title: string;
  // the web address of a small preview image
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
// destructing with naming: get the width object from the 'window' dimensions and name it WINDOW_WIDTH
const { width: WINDOW_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 8;
// *4 because outside and inside margins
const CARD_WIDTH = (WINDOW_WIDTH - CARD_MARGIN * 4) / 2;

interface ListingCardProps {
  price: string;
  title: string;
  // | means that could be empty
  imageUrl: string | null;
  // function that takes no arguments and doesn't return anything: JUST A DEFAULT!
  onPress: () => void;
}

/**
 * ListingCard
 *
 * Displays a single listing card. Uses the real image if provided,
 * otherwise shows a placeholder.
 */
/**
 * ":" means that this variable has to be type ListingCardProps
 * React.FC means that this is a functional component (FC) -> compenent that is written like a function
 * <ListingCardProps> means that this component takes in props that match the ListingCardProps interface
 * 
 */
const ListingCard: React.FC<ListingCardProps> = ({ price, title, imageUrl, onPress }) => {
  //gets and stores the theme of the app
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
        const backendUrl = "http://172.20.10.3:8000";
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
