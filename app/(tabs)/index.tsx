import React, { useCallback } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { Appbar, Card, Chip, IconButton, useTheme } from 'react-native-paper';

// TODO: Replace with API data, placeholder data
const listings = [
  { id: '1', price: '$30', description: 'Pickup by Friday', imageUrl: null },
  { id: '2', price: '$45', description: 'Pickup ASAP', imageUrl: null },
  { id: '3', price: '$20', description: 'Pickup by Fart', imageUrl: null },
  { id: '4', price: '$15', description: 'Pickup Today', imageUrl: null },
  { id: '5', price: '$50', description: 'Pickup Weekend', imageUrl: null },
  { id: '6', price: '$40', description: 'Pickup by Tuesday', imageUrl: null },
];

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (WINDOW_WIDTH - CARD_MARGIN * 4) / 2;

// ListingCard Component, takes in price, description, and imageURL
const ListingCard = ({ price, description, imageUrl }) => {
  const theme = useTheme();
  
  return (
    <Card style={styles.card}>
      {/* TODO: Replace with actual image component when imageUrl is available */}
      <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primary }]} />
      <Card.Content style={styles.cardContent}>
        <Text style={styles.priceText}>{price}</Text>
        <Text style={styles.descriptionText} numberOfLines={1}>
          {description}
        </Text>
      </Card.Content>
    </Card>
  );
};

export default function LandingScreen() {
  // TODO: Implement filter logic
  const handleFilterPress = useCallback(() => {}, []);
  
  const renderItem = useCallback(({ item }) => (
    <ListingCard
      price={item.price}
      description={item.description}
      imageUrl={item.imageUrl}
    />
  ), []);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <Appbar.Header style={styles.header}>
        <Chip
          mode="outlined"
          onPress={handleFilterPress}
          style={styles.filterChip}>
          Campus Circle
        </Chip>
        <View style={styles.headerRight}>
          <IconButton icon="magnify" size={24} onPress={() => {}} />
          <IconButton icon="account-circle-outline" size={24} onPress={() => {}} />
        </View>
      </Appbar.Header>

      {/* Listings Grid */}
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerRight: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  filterChip: {
    marginLeft: 8,
  },
  listContainer: {
    padding: CARD_MARGIN,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: CARD_MARGIN * 2,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabPressed: {
    opacity: 0.7,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: -4,
  },
});
