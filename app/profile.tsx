/**
 * ProfileScreen
 *
 * Clean, standardized React Native screen matching the Profile mockup design.
 * Features reusable ListRow component and consistent styling with SF Pro fonts.
 */
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  role_id: number | null;
  major_id: number;
  major_name: string;
  region_id: number;
  campus_region: string;
  rating: number | null;
  entry_year: number;
  class_year: number;
  time_created: string;
  time_updated: string;
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
    role_id: number | null;
    major_id: number;
    major_name: string;
    region_id: number;
    campus_region: string;
    rating: number | null;
    entry_year: number;
    class_year: number;
    time_created: string;
    time_updated: string;
  }>;
  count: number;
}

// Reusable ListRow component
interface ListRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
}

function ListRow({ iconName, label, subtitle, onPress }: ListRowProps) {
  return (
    <Pressable
      style={styles.listRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.listRowIcon}>
        <Ionicons name={iconName} size={24} color="#8B5CF6" />
      </View>
      <View style={styles.listRowContent}>
        <Text style={styles.listRowLabel}>{label}</Text>
        {subtitle && <Text style={styles.listRowSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#000" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

  // Profile data state management
  // Stores the user's profile information fetched from the backend
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  // Loading state to show spinner/placeholder while fetching profile data
  const [profileLoading, setProfileLoading] = useState(false);
  // Error state to handle and display API errors
  const [profileError, setProfileError] = useState<string | null>(null);

  /**
   * Fetches profile data from the backend API for the current user
   * Uses default values for profileId and schemaName as specified
   * 
   * @param profileId - The unique identifier for the user profile (default: "51e242d0-e313-47f8-a881-27bba664a57b")
   * @param schemaName - The database schema name (default: "ucberkeley")
   */
  const fetchProfile = async (
    profileId: string = "51e242d0-e313-47f8-a881-27bba664a57b",
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
   * Runs when the component is first rendered
   * Uses the default profileId and schemaName values
   */
  useEffect(() => {
    fetchProfile();
  }, []);

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
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
            </Pressable>
          ),
        }}
      />
      
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Profile Section Header */}
          <View style={styles.header}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <View style={styles.divider} />
          </View>

          {/* Profile Card Row */}
          <Pressable
            style={styles.profileCard}
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            {profileData && profileData.profile_pic_url ? (
              <Image 
                source={{ uri: profileData.profile_pic_url }} 
                style={styles.avatarImage}
                defaultSource={require('../assets/images/icon.png')}
              />
            ) : (
              <View style={styles.avatar} />
            )}
            <View style={styles.profileInfo}>
              {profileLoading ? (
                <>
                  <Text style={styles.profileName}>Loading...</Text>
                  <Text style={styles.profileSubtitle}>Please wait</Text>
                </>
              ) : profileError ? (
                <>
                  <Text style={styles.profileName}>Error loading profile</Text>
                  <Text style={styles.profileSubtitle}>{profileError}</Text>
                </>
              ) : profileData ? (
                <>
                  <Text style={styles.profileName}>
                    {profileData.fname} {profileData.lname}
                  </Text>
                  <Text style={styles.profileSubtitle}>
                    {profileData.class_year} - {profileData.major_name}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.profileName}>Full Name</Text>
                  <Text style={styles.profileSubtitle}>Year - Major</Text>
                </>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </Pressable>

          <View style={styles.divider} />

          {/* Profile Options */}
          <ListRow
            iconName="location"
            label="Location"
            subtitle={profileData ? profileData.campus_region : undefined}
            onPress={() => {}}
          />
          <ListRow
            iconName="star"
            label="Ratings"
            onPress={() => {}}
          />

          {/* Selling Section */}
          <View style={styles.sellingSection}>
            <Text style={styles.sectionTitle}>Selling</Text>
            <View style={styles.divider} />
          </View>

          <ListRow
            iconName="pricetag"
            label="Your Listings"
            onPress={() => router.push('/Your_Listings')}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  sellingSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#D6D2D2',
    marginHorizontal: -16,
  },
  backButton: {
    padding: 8,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 72,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#8B5CF6',
    marginRight: 16,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B6B6B',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 64,
  },
  listRowIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 16,
  },
  listRowContent: {
    flex: 1,
  },
  listRowLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  listRowSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B6B6B',
    marginTop: 2,
  },
});
