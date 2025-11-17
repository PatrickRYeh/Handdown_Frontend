/**
 * UpdateListingScreen
 *
 * Edit an existing listing: modify photos, update details (title,
 * description, price), change condition/category, and update location.
 * Pre-fills form with existing listing data and tracks changes.
 *
 * Notes
 * - Uses passed parameters from Your_Listings.tsx for immediate loading
 * - Falls back to API fetch if accessed directly
 * - Only sends changed fields to API endpoints
 * - Separate API calls for basic info and images
 */
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, IconButton, Menu, Surface, TextInput } from 'react-native-paper';

// Dropdown options for condition and category
const CONDITION_OPTIONS: { label: string; value: string }[] = [
  { label: 'New', value: 'new' },
  { label: 'Used – Like New', value: 'used-like-new' },
  { label: 'Used – Fair', value: 'used-fair' },
];

const CATEGORIES: { label: string; value: number }[] = [
  { label: 'Furniture', value: 1 },
  { label: 'Apparel', value: 4 }
];

// Typed props and small presentational components
interface PhotoThumbnailProps {
  uri: string;
  onRemove: () => void;
}

/** Displays a selected photo with a small remove button */
const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({ uri, onRemove }) => (
  <View style={styles.thumbnailContainer}>
    <Image source={{ uri }} style={styles.thumbnail} />
    <IconButton
      icon="close"
      size={16}
      style={styles.removeButton}
      onPress={onRemove}
    />
  </View>
);

interface LabeledInputProps extends Omit<React.ComponentProps<typeof TextInput>, 'error' | 'label'> {
  label: string;
  errorMessage?: string;
}

/** Text input with a label and optional error helper text */
const LabeledInput: React.FC<LabeledInputProps> = ({ label, errorMessage, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      mode="outlined"
      style={styles.input}
      error={!!errorMessage}
      {...props}
    />
    {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
  </View>
);

interface DropdownFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  error?: string;
}

/** Press-to-open menu for selecting one option */
const DropdownField: React.FC<DropdownFieldProps> = ({ label, value, options, onSelect, error }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Pressable
            style={[styles.dropdown, error && styles.dropdownError]}
            onPress={() => setVisible(true)}>
            <Text style={styles.dropdownText}>{value || `Select ${label}`}</Text>
          </Pressable>
        }>
        {options.map((option: string) => (
          <Menu.Item
            key={option}
            onPress={() => {
              onSelect(option);
              setVisible(false);
            }}
            title={option}
          />
        ))}
      </Menu>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default function UpdateListingScreen() {
  const params = useLocalSearchParams();
  const listingId = params.id as string;

  // Form state
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [conditionValue, setConditionValue] = useState('');
  const [categoryValue, setCategoryValue] = useState<number | null>(null);
  const [location, setLocation] = useState('');
  
  // Original data for change tracking
  const [originalData, setOriginalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Field-level error messages
  type FormErrors = Partial<{
    images: string;
    title: string;
    description: string;
    price: string;
    condition: string;
    category: string;
    location: string;
  }>;
  const [errors, setErrors] = useState<FormErrors>({});

  // Load listing data - runs once on component mount
  useEffect(() => {
    if (dataLoaded) return; // Prevent multiple loads
    
    const loadListingData = async () => {
      if (!listingId) return;
      
      setLoading(true);
      
      try {
        // Check if we have data passed from Your_Listings.tsx
        if (params.title) {
          console.log('Loading from params...');
          
          // Parse listing images if they exist
          let listingImages = null;
          let tags = null;
          
          try {
            listingImages = params.listing_images ? JSON.parse(params.listing_images as string) : null;
            tags = params.tags ? JSON.parse(params.tags as string) : null;
          } catch (parseError) {
            console.warn('Error parsing params:', parseError);
          }
          
          // Create data object from params
          const data = {
            listing_id: params.id,
            title: params.title as string,
            description: params.description as string,
            price: params.price ? Number(params.price) : null,
            condition: params.condition as string,
            listing_type_id: params.listing_type_id ? Number(params.listing_type_id) : null,
            thumbnail_url: params.thumbnail_url as string,
            time_created: params.time_created as string,
            time_updated: params.time_updated as string,
            region_id: params.region_id ? Number(params.region_id) : null,
            offering_uid: params.offering_uid as string,
            listing_images: listingImages,
            tags: tags,
          };
          
          // Store original data for change tracking
          setOriginalData(data);
          
          // Pre-fill form fields
          setTitle(data.title || '');
          setDescription(data.description || '');
          setPrice(data.price ? String(data.price) : '');
          setConditionValue(data.condition || '');
          setCategoryValue(data.listing_type_id || null);
          setLocation('Sample Location'); // TODO: Get from API or params
          
          // Pre-fill images if available
          const existingImages: string[] = [];
          if (data.thumbnail_url) existingImages.push(data.thumbnail_url);
          if (data.listing_images && Array.isArray(data.listing_images)) {
            existingImages.push(...data.listing_images.map((img: any) => img.image_url));
          }
          setImages(existingImages);
          
          console.log('Data loaded from params successfully');
        } else {
          // No params data, fetch from API
          console.log('No params data, fetching from API...');
          await fetchFromAPI();
        }
      } catch (error) {
        console.error('Error loading listing data:', error);
        alert('Failed to load listing data. Please try again.');
        router.back();
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    };

    const fetchFromAPI = async () => {
      const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      const res = await fetch(`${backendUrl}/listings/${listingId}`, {
        headers: { Accept: 'application/json' }
      });
      
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      
      // Store original data for change tracking
      setOriginalData(data);
      
      // Pre-fill form fields
      setTitle(data.title || '');
      setDescription(data.description || '');
      setPrice(data.price ? String(data.price) : '');
      setConditionValue(data.condition || '');
      setCategoryValue(data.listing_type_id || null);
      setLocation(data.location || 'Sample Location');
      
      // Pre-fill images if available
      const existingImages: string[] = [];
      if (data.thumbnail_url) existingImages.push(data.thumbnail_url);
      if (data.other_images && Array.isArray(data.other_images)) {
        existingImages.push(...data.other_images);
      }
      setImages(existingImages);
      
      console.log('Data loaded from API successfully');
    };

    loadListingData();
  }, []); // Empty dependency array - only runs once

  // Image picker: requests permission, allows selecting up to 10 images
  const handlePickImages = async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      setImages(result.assets.map((asset) => asset.uri));
    }
  };

  // Validate inputs and set error messages; returns true if the form is valid
  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!images.length) newErrors.images = 'Please select at least one image';
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!price || Number.isNaN(Number(price))) newErrors.price = 'Please enter a valid price';
    if (!conditionValue) newErrors.condition = 'Please select a condition';
    if (!categoryValue) newErrors.category = 'Please select a category';
    if (!location) newErrors.location = 'Please select a location';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Track what has changed
  const getChangedFields = () => {
    if (!originalData) return {};
    
    const changes: any = {};
    
    if (title !== (originalData.title || '')) changes.title = title;
    if (description !== (originalData.description || '')) changes.description = description;
    if (Number(price) !== originalData.price) changes.price = Number(price);
    if (conditionValue !== (originalData.condition || '')) changes.condition = conditionValue;
    if (categoryValue !== originalData.listing_type_id) changes.listing_type_id = categoryValue;
    // Note: location and other fields can be added here as needed
    
    return changes;
  };

  // Check if images have changed
  const getImageChanges = () => {
    if (!originalData) return { hasChanges: false, newImages: [] };
    
    const originalImages: string[] = [];
    if (originalData.thumbnail_url) originalImages.push(originalData.thumbnail_url);
    if (originalData.other_images && Array.isArray(originalData.other_images)) {
      originalImages.push(...originalData.other_images);
    }
    
    // Simple check: if arrays are different lengths or contain different URLs
    const hasChanges = images.length !== originalImages.length || 
                      images.some((img, index) => img !== originalImages[index]);
    
    return { hasChanges, newImages: images };
  };

  // Submit form: Updates listing via API then navigates back
  const handleUpdate = async () => {
    if (!validateForm()) return;

    const changedFields = getChangedFields();
    const imageChanges = getImageChanges();
    
    // Build the update payload with only changed fields
    const updateData: any = {
      schema_name: "ucberkeley", // Required field
    };
    
    // Add changed fields to the payload
    if (changedFields.title !== undefined) {
      updateData.title = changedFields.title;
    }
    if (changedFields.description !== undefined) {
      updateData.description = changedFields.description;
    }
    if (changedFields.price !== undefined) {
      updateData.price = changedFields.price;
    }
    if (changedFields.condition !== undefined) {
      updateData.condition = changedFields.condition;
    }
    if (changedFields.listing_type_id !== undefined) {
      // Convert listing_type_id to tag_ids array format
      updateData.tag_ids = [changedFields.listing_type_id];
    }
    
    // Include region_id from original data if available
    if (originalData?.region_id) {
      updateData.region_id = originalData.region_id;
    }
    
    try {
      const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      
      // TODO: For troubleshooting - using hardcoded listing_id
      // Replace with listingId variable once working
      const testListingId = "dfde45d2-be1c-4674-8591-bf1bda1402cb";
      
      // Log for troubleshooting
      console.log('Update API URL:', `${backendUrl}/update-listing-basic-info/${testListingId}`);
      console.log('Update payload:', JSON.stringify(updateData, null, 2));
      
      // Make the API call to update basic listing info
      const response = await fetch(
        `${backendUrl}/update-listing-basic-info/${testListingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Update listing response:', data);
      
      // TODO: Handle image updates separately if imageChanges.hasChanges is true
      // This would require a separate API endpoint for updating images
      if (imageChanges.hasChanges) {
        console.log('Note: Image updates are not yet implemented');
      }
      
      // Navigate back to listings page on success
      router.push('/Your_Listings');
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Failed to update listing. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/Your_Listings');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading listing data...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Edit Listing',
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
          headerRight: () => (
            <View style={styles.headerRight}>
              <IconButton icon="magnify" size={24} />
              <IconButton icon="account-circle-outline" size={24} />
            </View>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        {/* Photo picker area */}
        <Pressable onPress={handlePickImages} style={styles.photoPickerArea}>
          <Text style={styles.photoPickerText}>
            {images.length ? 'Tap to change photos' : 'Tap to add photos (1-10)'}
          </Text>
        </Pressable>

        {/* Selected photos */}
        {images.length > 0 && (
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageList}
            renderItem={({ item, index }) => (
              <PhotoThumbnail
                uri={item}
                onRemove={() => setImages(images.filter((_, i) => i !== index))}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}

        {/* Form inputs */}
        <Surface style={styles.formContainer}>
          <LabeledInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            maxLength={50}
            errorMessage={errors.title}
          />

          <LabeledInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
            errorMessage={errors.description}
          />

          <LabeledInput
            label="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            errorMessage={errors.price}
          />

          <DropdownField
            label="Condition"
            value={CONDITION_OPTIONS.find(c => c.value === conditionValue)?.label || ''}
            options={CONDITION_OPTIONS.map(c => c.label)}
            onSelect={(selectedLabel) => {
              const mapped = CONDITION_OPTIONS.find(c => c.label === selectedLabel);
              if (mapped) setConditionValue(mapped.value);
            }}
            error={errors.condition}
          />

          <DropdownField
            label="Category"
            value={CATEGORIES.find(c => c.value === categoryValue)?.label || ''}
            options={CATEGORIES.map(c => c.label)}
            onSelect={(selectedLabel) => {
              const mapped = CATEGORIES.find(c => c.label === selectedLabel);
              if (mapped) setCategoryValue(mapped.value);
            }}
            error={errors.category}
            />

          {/* Location picker placeholder */}
          <Pressable
            style={[styles.locationPicker, errors.location && styles.locationPickerError]}
            onPress={() => setLocation('Sample Location')}>
            <Text style={styles.locationPickerText}>
              {location || 'Select location'}
            </Text>
          </Pressable>
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </Surface>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={[styles.actionButton, styles.cancelButton]}>
            Cancel
          </Button>
          
          <Button
            mode="contained"
            onPress={handleUpdate}
            style={[styles.actionButton, styles.updateButton]}
            buttonColor="#6222B1">
            Update
          </Button>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
  },
  backButton: {
    padding: 8,
  },
  photoPickerArea: {
    height: 200,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#90CAF9',
    borderStyle: 'dashed',
  },
  photoPickerText: {
    color: '#1976D2',
    fontSize: 16,
  },
  imageList: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  thumbnailContainer: {
    marginRight: 8,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  formContainer: {
    padding: 16,
    elevation: 2,
    margin: 16,
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    padding: 12,
  },
  dropdownError: {
    borderColor: '#B00020',
  },
  dropdownText: {
    fontSize: 16,
  },
  locationPicker: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    padding: 12,
    marginBottom: 4,
  },
  locationPickerError: {
    borderColor: '#B00020',
  },
  locationPickerText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
  },
  cancelButton: {
    marginRight: 8,
  },
  updateButton: {
    marginLeft: 8,
  },
});