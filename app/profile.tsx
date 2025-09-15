/**
 * ProfileScreen
 *
 * User profile page showing selling section with "Your Listings" placeholder.
 * Matches the design with purple tag icon, back navigation, and clean layout.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { IconButton, Surface } from 'react-native-paper';

export default function ProfileScreen() {
  const router = useRouter();

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
        {/* Selling Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selling</Text>
          
          {/* Your Listings Card */}
          <Surface style={styles.listingsCard} elevation={0}>
            <View style={styles.listingsContent}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name="tag" 
                  size={24} 
                  color="#fff" 
                />
              </View>
              <Text style={styles.listingsTitle}>Your Listings</Text>
            </View>
          </Surface>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  listingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  listingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#6222B1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});
