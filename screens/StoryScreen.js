import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const StoryScreen = ({ route }) => {
  const story = route.params?.story;

  if (!story) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No story available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.storyText}>{story}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2855AE',
    padding: 16,
    paddingTop: 80,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'left',
    paddingHorizontal: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default StoryScreen;
