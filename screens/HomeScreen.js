import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Animated, Dimensions, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import axios from 'axios';
import { speak, isSpeakingAsync, stop } from "expo-speech";
import ChatBubble from "./ChatBubble";
import firebase from './../firebase';

const HomeScreen = ({ navigation }) => {
  const [chat, setChat] = useState([]);
  const [mainCharacter, setMainCharacter] = useState("");
  const [supportingCharacter, setSupportingCharacter] = useState("");
  const [title, setTitle] = useState("");
  const [plot, setPlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [story, setStory] = useState("");
  const [showStory, setShowStory] = useState(false);
  const [userUID, setUserUID] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false); // Sesli okuma durumu

  const API_KEY = "AIzaSyD2j5WYAt1Aii6jlCh2Kc9N7lL5n4lfnT8"; // Replace with your actual API key
  const firestore = firebase.firestore();

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getCurrentUser = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        setUserUID(user.uid);
      } else {
        setError("User not authenticated");
      }
    };

    getCurrentUser();
  }, []);

  const handleUserInput = async () => {
    let updatedChat = [
      ...chat,
      {
        role: "user",
        parts: [
          { text: `Main Character: ${mainCharacter}` },
          { text: `Supporting Character: ${supportingCharacter}` },
          { text: `Title: ${title}` },
          { text: `Plot: ${plot}` },
        ],
      },
    ];

    setLoading(true);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
          contents: updatedChat,
        }
      );

      console.log("Gemini Pro API Response:", response.data);

      const modelResponse = response.data?.candidates?.[0]?.content?.parts?.map(part => part.text).join(' ') || " ";

      if (modelResponse) {
        const updatedChatWithModel = [
          ...updatedChat,
          {
            role: "model",
            parts: [{ text: modelResponse }],
          },
        ];

        setChat(updatedChatWithModel);
        setMainCharacter("");
        setSupportingCharacter("");
        setTitle("");
        setPlot("");
        setStory(modelResponse);
        setShowStory(true);

        if (userUID) {
          try {
            await firestore.collection("users").doc(userUID).collection("stories").add({
              mainCharacter,
              supportingCharacter,
              title,
              plot,
              story: modelResponse,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log("Story successfully saved to Firestore");
          } catch (firestoreError) {
            console.error("Error saving story to Firestore:", firestoreError);
            setError("Error saving story to Firestore");
          }
        } else {
          setError("User UID is not set");
        }

        Animated.timing(slideAnim, {
          toValue: -Dimensions.get('window').height + 100,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          navigation.navigate('Story', { story: modelResponse });
        });
      }
    } catch (error) {
      console.error("Error calling Gemini Pro API:", error);
      console.error("Error response:", error.response);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeech = async (text) => {
    if (isSpeaking) {
      stop();
      setIsSpeaking(false);
    } else {
      if (!(await isSpeakingAsync())) {
        speak(text);
        setIsSpeaking(true);
      }
    }
  };

  const renderChatItem = ({ item }) => (
    <ChatBubble
      role={item.role}
      text={item.parts[0].text}
      onSpeech={() => handleSpeech(item.parts[0].text)}
    />
  );

  const handleReset = () => {
    setShowStory(false);
    setStory("");
    setMainCharacter(chat[0]?.parts[0]?.text.split(": ")[1] || "");
    setSupportingCharacter(chat[0]?.parts[1]?.text.split(": ")[1] || "");
    setTitle(chat[0]?.parts[2]?.text.split(": ")[1] || "");
    setPlot(chat[0]?.parts[3]?.text.split(": ")[1] || "");

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setShowStory(false);
      setStory("");
      setMainCharacter("");
      setSupportingCharacter("");
      setTitle("");
      setPlot("");
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }).start();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.blueSection}>
            <Text style={styles.title}>HİKAYE KRİTERLERİ</Text>
          </View>
          <Animated.View style={[styles.inputContainer, { transform: [{ translateY: slideAnim }] }]}>
            <TextInput
              style={styles.input}
              placeholder="Ana Karakter Kim Olmalı"
              placeholderTextColor="#333"
              value={mainCharacter}
              onChangeText={text => setMainCharacter(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Yardımcı Karakter Kim Olmalı"
              placeholderTextColor="#333"
              value={supportingCharacter}
              onChangeText={text => setSupportingCharacter(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Başlık Ne Olmalı"
              placeholderTextColor="#333"
              value={title}
              onChangeText={text => setTitle(text)}
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Ana Fikir"
              placeholderTextColor="#333"
              value={plot}
              onChangeText={text => setPlot(text)}
              multiline={true}
              scrollEnabled={true}
            />
            <TouchableOpacity style={styles.button} onPress={handleUserInput}>
              <Text style={styles.buttonText}>Hikaye Oluştur</Text>
            </TouchableOpacity>
          </Animated.View>

          {showStory && (
            <ScrollView style={styles.fullScreenStoryContainer} contentContainerStyle={styles.fullScreenStoryContent}>
              <Text style={styles.storyText}>{story}</Text>
              <TouchableOpacity style={styles.button} onPress={handleReset}>
                <Text style={styles.buttonText}>Yeni Hikaye Oluştur</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => handleSpeech(story)}>
                <Text style={styles.buttonText}>Hikayeyi Sesli Oku</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {loading && <ActivityIndicator style={styles.loading} color={"#333"} />}
          {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingTop: Dimensions.get('window').height / 3,
  },
  blueSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Dimensions.get('window').height / 3,
    backgroundColor: "#2855AE",
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  inputContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 30,
    borderColor: "#2855AE",
    borderWidth: 1,
    height: 400,
    justifyContent: 'center',
  },
  input: {
    height: 50,
    marginBottom: 10,
    padding: 8,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 5,
    color: "#333",
    backgroundColor: "#fff",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    padding: 10,
    backgroundColor: "#2855AE",
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
  loading: {
    marginTop: 10,
  },
  error: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  fullScreenStoryContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderColor: "#2855AE",
    borderWidth: 1,
    marginHorizontal: 16,
  },
  fullScreenStoryContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyText: {
    color: '#333',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default HomeScreen;
