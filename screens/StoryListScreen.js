import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firebase from '../firebase';
import { RectButton, Swipeable } from 'react-native-gesture-handler';

const StoryListScreen = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStories = () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const unsubscribe = firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .collection('stories')
        .orderBy('timestamp', 'desc')
        .onSnapshot(
          (snapshot) => {
            const storiesList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            setStories(storiesList);
            setLoading(false);
          },
          (error) => {
            setError(error.message);
            setLoading(false);
          }
        );

      return unsubscribe;
    };

    fetchStories();
  }, []);

  const deleteStory = async (id) => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        setError('User not authenticated');
        return;
      }

      await firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .collection('stories')
        .doc(id)
        .delete();

      // Remove the story from the local state
      setStories(stories.filter(story => story.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Hikayeyi Sil",
      "Bu hikayeyi silmek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Sil", onPress: () => deleteStory(id), style: "destructive" }
      ]
    );
  };

  const renderRightActions = (id) => (
    <RectButton style={styles.deleteButton} onPress={() => confirmDelete(id)}>
      <Text style={styles.deleteButtonText}>Sil</Text>
    </RectButton>
  );

  const renderStoryItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={styles.storyItem}>
        <TouchableOpacity onPress={() => navigation.navigate('StoryDetail', { story: item })}>
          <Text style={styles.storyTitle}>{item.title}</Text>
          <Text style={styles.storyPreview}>{item.story.slice(0, 100)}...</Text>
        </TouchableOpacity>
      </View>
    </Swipeable>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#ffffff" style={styles.loading} />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#2855AE',
    paddingTop: 80, // Increased the top padding
  },
  storyItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  storyPreview: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF5C5C',
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default StoryListScreen;
