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
  /**
   * useEffect automatically runs/fetches the data when the component loads
   */
  useEffect(() => {
    // async means that this function will do things that take a little time
    const fetchListings = async () => {
      try {
        // TODO -- make this environment var (do ifconfig and find en0 ip address)
        const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
        // variable stores the server response, wait for response before continuing
        // ` allow you to insert variables into a string
        // '?' starts the query parameters
        const res = await fetch(
          `${backendUrl}/listings/get-batch-listings-by-recency?listing_query_str=${queryStr}`,
          // headers are the "instructions on the outside of the envelope"
          // Accept: 'application/json' means that the server will only accept JSON responses
          { headers: { Accept: 'application/json' } }
        );
        // throw stops everything and creates an error
        // res.status is the error code if one exists (ie 404, 500, etc)
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        // data is the server response, wait for response before continuing
        const data = await res.json();
        // logs the server's response
        console.log("API response:", data.message);

        // ==========================================
        // 🔍 DEBUG: API RESPONSE ANALYSIS
        // This shows what the backend is actually returning
        // ==========================================
        console.log("\n=== 🔍 API DEBUGGING START ===");
        console.log("📦 Full API response:", data);
        console.log("📊 Number of listings returned:", data.listings?.length || 0);
        if (data.listings && data.listings.length > 0) {
          console.log("🔍 First listing raw data:", data.listings[0]);
          console.log("🖼️ First listing thumbnail_url:", data.listings[0].thumbnail_url);
          console.log("🖼️🖼️ First listing other_images:", data.listings[0].other_images);
          console.log("📏 Type of other_images:", typeof data.listings[0].other_images);
          if (data.listings[0].other_images) {
            console.log("📏 Length of other_images array:", data.listings[0].other_images.length);
          }
        }
        console.log("=== 🔍 API DEBUGGING END ===\n");

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

        /**
         * mappedListing is a variable to store the transformed data
         * Listing[] initializes an empty array of listings in specified format
         * data.listings extracts the listings data from the response, ?? means if it's null, then use an empty array
         * .map() is a function that transforms each item in the array into a new format
         * 
         */
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

        // ==========================================
        // 🔍 DEBUG: DATA MAPPING ANALYSIS
        // This shows how we transformed the API data
        // ==========================================
        console.log("\n=== 🔄 DATA MAPPING DEBUGGING START ===");
        console.log("📊 Number of mapped listings:", mappedListings.length);
        if (mappedListings.length > 0) {
          console.log("🔄 First mapped listing:", mappedListings[0]);
          console.log("🔄 Mapped other_images:", mappedListings[0].other_images);
        }
        console.log("=== 🔄 DATA MAPPING DEBUGGING END ===\n");

        setListings(mappedListings);
      } catch (err) {
        console.error(err);
      }
    };

    fetchListings();
  }, []);

  // default function that does nothing for now
  // will be used for listing filtering later
  const handleFilterPress = useCallback(() => {}, []);
  
  const handleListingPress = useCallback((listing: Listing) => {
    // ==========================================
    // 🔍 DEBUG: NAVIGATION DATA ANALYSIS
    // This shows what data we're sending to the detail page
    // ==========================================
    console.log("\n=== 🚀 NAVIGATION DEBUGGING START ===");
    console.log("🎯 Selected listing:", listing);
    console.log("🖼️ thumbnail_url being sent:", listing.thumbnail_url);
    console.log("🖼️🖼️ other_images being sent:", listing.other_images);
    console.log("📦 JSON string of other_images:", listing.other_images ? JSON.stringify(listing.other_images) : 'null');
    console.log("=== 🚀 NAVIGATION DEBUGGING END ===\n");
    
    // routes to [id] screen and sends the listing id, price, title, and imageUrl
    router.push({
      pathname: '/[id]',
      // params is the data that is sent to the [id] screen so that not need to load again
      params: {
        id: listing.id,
        price: listing.price,
        title: listing.title,
        imageUrl: listing.thumbnail_url,
        description: listing.description,
        listing_type_id: listing.listing_type_id.toString(), // convert number to string for URL params
        time_updated: listing.time_updated,
        region_id: listing.region_id.toString(), // convert number to string for URL params
        condition: listing.condition,
        offering_uid: listing.offering_uid,
        // Handle the array - convert to JSON string since URL params only accept strings
        other_images: listing.other_images ? JSON.stringify(listing.other_images) : null,
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
