import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Appbar, IconButton } from 'react-native-paper';

export default function MovingScreen() {
  return (
    <View style={styles.container}>
      {/* Header with Search and Profile Icons */}
      <Appbar.Header style={styles.header}>
        <View style={styles.headerLeft} />
        <View style={styles.headerRight}>
          <IconButton icon="magnify" size={24} onPress={() => {}} />
          <IconButton 
            icon="account-circle-outline" 
            size={24} 
            onPress={() => router.push('/profile')} 
          />
        </View>
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Question Text */}
        <Text style={styles.questionText}>
          What type of Assistance to do you need?
        </Text>

        {/* Door to Door Button */}
        <Pressable style={styles.buttonContainer}>
          <View style={[styles.leftSection, { backgroundColor: '#85A7FF' }]}>
            <Text style={styles.moveTypeText}>Door to Door</Text>
            <Text style={styles.priceText}>($35)</Text>
          </View>
          <View style={styles.rightSection}>
            <Text style={styles.descriptionText}>-Pickup at seller door</Text>
            <Text style={styles.descriptionText}>-Drop off at buyer door</Text>
            <Text style={styles.descriptionText}>-You will need to assist</Text>
          </View>
        </Pressable>

        {/* Complete Move Button */}
        <Pressable style={styles.buttonContainer}>
          <View style={[styles.leftSection, { backgroundColor: '#A682FF' }]}>
            <Text style={styles.moveTypeText}>Complete</Text>
            <Text style={styles.moveTypeText}>Move</Text>
            <Text style={styles.priceText}>($65)</Text>
          </View>
          <View style={styles.rightSection}>
            <Text style={styles.descriptionText}>-Full extraction</Text>
            <Text style={styles.descriptionText}>-Door to door</Text>
            <Text style={styles.descriptionText}>-Full input</Text>
          </View>
        </Pressable>

        {/* Heavy Duty Button */}
        <Pressable style={styles.buttonContainer}>
          <View style={[styles.leftSection, { backgroundColor: '#6222B1' }]}>
            <Text style={styles.moveTypeText}>Heavy</Text>
            <Text style={styles.moveTypeText}>Duty</Text>
            <Text style={styles.priceText}>($85)</Text>
          </View>
          <View style={styles.rightSection}>
            <Text style={styles.descriptionText}>-Everything in complete move</Text>
            <Text style={styles.descriptionText}>-Larger than a pickup truck</Text>
            <Text style={styles.descriptionText}>-Greater than one set of stairs</Text>
          </View>
        </Pressable>

        {/* Bottom Information Text */}
        <Text style={styles.bottomText}>
          You will be put in contact with a college student mover based on availability.
        </Text>
      </ScrollView>
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
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 120,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  leftSection: {
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  rightSection: {
    width: '60%',
    backgroundColor: '#7C827D',
    justifyContent: 'center',
    padding: 15,
  },
  moveTypeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  priceText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
  },
  descriptionText: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 4,
  },
  bottomText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000',
    marginTop: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
}); 