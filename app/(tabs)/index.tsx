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
// useEffect: a component/tool that lets you perform things when your screen loads or changes, for actions like "fetch data when the page loads", sets up automatic tasks that happen at speciic times
// useState: a hook that lets you track and update values in your component, for storing data that can change (like user input, loading states, etc)
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
  thumbnail_url: string;
  offering_uid: string;
  description: string;
  listing_type_id: number;
  time_updated: string;
  region_id: number;
  condition: string;
  listing_images: { position: number; image_url: string }[] | null;
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
 * { price, title, imageUrl, onPress } means that this component takes in these four properties/destructers these 4 props
 */
const ListingCard: React.FC<ListingCardProps> = ({ price, title, imageUrl, onPress }) => {
  //gets and stores the theme of the app
  const theme = useTheme();
  
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        {/* '?' is a ternary operator, means if imageUrl is true, then do this, otherwise do this 
        if yes (first parentheses), then uri: imageUrl, otherwise (':' then second parentheses), then <View> with a background color */}
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.imagePlaceholder}
            // resizeMode="cover" means that it will scale the image to cover the entire space, maintaining aspect ratio
            resizeMode="cover"
          />
        ) : (
          // backgroundColor: theme.colors.primary means that the background color will be the primary color of the app (usually purple)
          // view is just a basic stand-in frame
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primary }]} />
        )}
        {/* Card.Content is a component that contains the content of the card */}
        <Card.Content style={styles.cardContent}>
          <Text style={styles.priceText}>{price}</Text>
          {/* numberOfLines={1} means that the text will be truncated if it is too long */}
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        </Card.Content>
      </Card>
    </Pressable>
  );
};

//main component that will be exported and used in other files
export default function LandingScreen() {
  /**
   * State to hold fetched listings (from API)
   * listings is an array of Listing objects
   * setListings is a function that updates the listings state
   * useState is a hook that allows you to track and update a value in your component
   * <Listing[]> indicates the props interface (from earlier
   * []) initializes the array to empty
   */ 
  
  // State variable to hold all of the listings currently displayed on the screen
  // starts as empty array and new listings added when load more pages
  const [listings, setListings] = useState<Listing[]>([]);
  // State variable to hold the loading state (whether data is currently being fetched)
  // starts as false and becomes true when loading data
  const [loading, setLoading] = useState(false);
  // State variable that tracks whether there are more listings available to load from the server
  // starts as true and becomes false when there are no more listings to load, stops app from loading more listings when none left
  const [hasMore, setHasMore] = useState(true);
  // State variable to hold the last time a listing was updated, last_time param for batch query
  // starts as null and becomes a string when a listing is updated
  const [lastTime, setLastTime] = useState<string | null>(null);

  // Query parameters for backend
  // TODO -- grab schema_name from cache
  // Auto store -- last time (for batches)
  // Build query -- add filters to window 
  const createQuery = (last_time: string | null) => {
    const query: any = {
      schema_name: "ucberkeley",
      limit: 12,
      filters: {}
    };
    
    // Only include last_time if we have one (not for initial load)
    if (last_time) {
      query.last_time = last_time;
    }
    
    return query;
  };

  // Fetch listings (calling the API endpoint here)
  const fetchListings = async (last_time: string | null = null, append: boolean = false) => {
    if (loading) return; // Prevent duplicate requests
    
    setLoading(true);
    try {
      const query = createQuery(last_time);
      const queryStr = encodeURIComponent(JSON.stringify(query));
      
      const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      const res = await fetch(
        `${backendUrl}/listings/get-batch-listings-by-recency?listing_query_str=${queryStr}`,
        { headers: { Accept: 'application/json' } }
      );
      
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

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
        listing_images: { position: number; image_url: string }[] | null;
      }
      
      /**
         * mappedListing is a variable to store the transformed data
         * Listing[] initializes an empty array of listings in specified format
         * data.listings extracts the listings data from the response, ?? means if it's null, then use an empty array
         * .map() is a function that transforms each item in the array into a new format
         */
      const mappedListings: Listing[] = (data.listings ?? []).map((item: ApiListing) => {
        // Sort images by position and get the first one for thumbnail
        const sortedImages = item.listing_images 
          ? [...item.listing_images].sort((a, b) => a.position - b.position)
          : null;
        
        const thumbnailUrl = sortedImages && sortedImages.length > 0 
          ? sortedImages[0].image_url 
          : '';

        return {
          id: item.listing_id,
          price: `$${String(item.price)}`,
          title: item.title,
          thumbnail_url: thumbnailUrl,
          description: item.description ?? '',
          listing_type_id: item.listing_type_id,
          time_updated: item.time_updated,
          region_id: item.region_id,
          condition: item.condition,
          listing_images: item.listing_images,
          offering_uid: item.offering_uid,
        };
      });

      // Check if we have more data to load
      setHasMore(mappedListings.length === 12);
      
      if (append) {
        // Add new listings to existing ones
        // prev is previous state of listing array
        // ... unpacks each array so can concatenate them
        setListings(prev => [...prev, ...mappedListings]);
      } else {
        // Replace listings (initial load)
        setListings(mappedListings);
      }
      
      // Update lastTime with the time_updated from the last listing
      if (mappedListings.length > 0) {
        const lastListing = mappedListings[mappedListings.length - 1];
        setLastTime(lastListing.time_updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load**
  useEffect(() => {
    fetchListings(null, false);
  }, []);

  // Load more function for infinite scroll
  const loadMore = () => {
    if (hasMore && !loading) {
      fetchListings(lastTime, true);
    }
  };

  // default function that does nothing for now
  // will be used for listing filtering later
  const handleFilterPress = useCallback(() => {}, []);
  
  const handleListingPress = useCallback((listing: Listing) => {
    router.push({
      pathname: '/[id]',
      params: {
        id: listing.id,
        price: listing.price,
        title: listing.title,
        description: listing.description,
        listing_type_id: listing.listing_type_id.toString(),
        time_updated: listing.time_updated,
        region_id: listing.region_id.toString(),
        condition: listing.condition,
        offering_uid: listing.offering_uid,
        listing_images: listing.listing_images ? JSON.stringify(listing.listing_images) : null,
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
      // calls the handleListingPress function with the item to send to [id] screen
      onPress={() => handleListingPress(item)}
    />
    // [handleListingPress]); just closes the useCallback function by saying, only change if handleListingPress changes
  ), [handleListingPress]);

  // just grabs unique id for display
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
          <IconButton 
            icon="account-circle-outline" 
            size={24} 
            onPress={() => router.push('/profile')} 
          />
        </View>
      </Appbar.Header>

      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={loading && listings.length === 0}
        onRefresh={() => {
          setLastTime(null);
          setHasMore(true);
          fetchListings(null, false);
        }}
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
