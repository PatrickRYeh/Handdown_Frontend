/**
 * CreateListingScreen
 *
 * Compose and publish a new listing: select photos, enter details (title,
 * description, price), choose condition/category, and pick a location.
 *
 * Notes
 * - Image picking and network calls are basic stubs; wire to real services later.
 * - Validation provides inline error messages for each field.
 */
import { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, IconButton, Menu, Surface, TextInput } from 'react-native-paper';

// Dropdown options for condition and category
// const CONDITIONS = ['New', 'Used – Like New', 'Used – Fair'];
// UPDATE -- mapping conditions
const CONDITION_OPTIONS: { label: string; value: string }[] = [
  { label: 'New', value: 'new' },
  { label: 'Used – Like New', value: 'used-like-new' },
  { label: 'Used – Fair', value: 'used-fair' },
];

// UPDATE -- mapping categories
const CATEGORIES: { label: string; value: number }[] = [
  { label: 'Furniture', value: 1 },
  { label: 'Apparel', value: 4 }
];
// const CATEGORIES = ['Furniture', 'Apparel', 'Accessories', 'Kitchen', 'Dorm Essentials', 'Tickets & Passes'];

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

export default function CreateListingScreen() {
  // Form state
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [conditionValue, setConditionValue] = useState('');
  const [categoryValue, setCategoryValue] = useState<number | null>(null);
  const [location, setLocation] = useState('');
  
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

  // Submit form: POSTs payload then navigates home
  const handlePublish = async () => {
    if (!validateForm()) return;

    const payload = {
      offering_uid: "51e242d0-e313-47f8-a881-27bba664a57b",
      schema_name: "ucberkeley",
      listing_type: 1,
      title: title,
      description: description,
      price: Number(price),
      condition: conditionValue,
      region_id: 1,
      tag_ids: categoryValue ? [categoryValue] : [],
      campus_region_id: 1
    };

    try {
      // Use same backend URL pattern as index.tsx
      const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      const listingStr = encodeURIComponent(JSON.stringify(payload));
      
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      
      // Add images to FormData
      for (let i = 0; i < images.length; i++) {
        const imageUri = images[i];
        
        // Create a file object from the image URI
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        // Generate a filename (you can customize this logic)
        const filename = `IMG_${Date.now()}_${i}.JPG`;
        
        // Append image to FormData
        formData.append('images', blob, filename);
      }
      
      const res = await fetch(
        `${backendUrl}/listings?listing_str=${listingStr}`,
        { 
          method: 'POST',
          headers: { 
            'Accept': 'application/json',
            // Don't set Content-Type - let the browser set it for multipart/form-data
          },
          body: formData
        }
      );
      
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      console.log("Create listing response:", data.message);
      
      router.push('/');
    } catch (error) {
      console.error('Error publishing listing:', error);
      alert('Failed to publish listing. Please try again.');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Create Listing',
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
            {images.length ? 'Add more photos' : 'Tap to add photos (1-10)'}
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

        {/* Publish button */}
        <Button
          mode="contained"
          onPress={handlePublish}
          style={styles.publishButton}
          buttonColor="#6222B1">
          Publish
        </Button>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
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
  publishButton: {
    margin: 16,
    marginTop: 8,
    paddingVertical: 8,
  },
}); 