import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const StoryDetailScreen = ({ route, navigation }) => {
  const story = route.params?.story;

  if (!story) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No story available.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{story.title}</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {story.story.split('\n').map((paragraph, index) => (
          <Text key={index} style={styles.storyText}>
            {paragraph}
          </Text>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#2855AE',
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  storyText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'left', // Sol hizalama
    paddingLeft: 16, // Paragraf başlangıcı için içeriden başlatma
    marginBottom: 10, // Paragraflar arasında boşluk
  },
  button: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 150,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#2855AE',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default StoryDetailScreen;
