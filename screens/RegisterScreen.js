import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const isValidPhoneNumber = () => {
    const phoneRegex = /^0\d{10}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleRegister = async () => {
    try {
      const auth = getAuth();
      const firestore = getFirestore();

      if (!isValidPhoneNumber()) {
        Alert.alert('Hata', 'Geçerli bir telefon numarası giriniz.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        firstName,
        lastName,
        email,
        phoneNumber,
      });

      navigation.navigate('Login');
    } catch (error) {
      console.error('Firebase Hata:', error.message);
      Alert.alert('Hata', 'Kayıt işlemi sırasında bir hata oluştu.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#2855AE', // Arka plan rengini buradan değiştirebilirsiniz
      padding: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 32,
      textAlign: 'center',
    },
    input: {
      height: 50,
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: 10,
      marginBottom: 16,
      paddingLeft: 10,
    },
    registerButton: {
      backgroundColor: '#7292CF',
      padding: 14,
      borderRadius: 10,
      marginTop: 20,
    },
    registerButtonText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: 18,
    },
    loginLink: {
      marginTop: 10,
      alignItems: 'center',
    },
    loginLinkText: {
      color: '#FFFFFF',
      fontSize: 16,
    },
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View>
          <Text style={styles.title}>Kayıt Ol</Text>
          <TextInput
            style={styles.input}
            placeholder="İsim"
            onChangeText={(text) => setFirstName(text)}
            value={firstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Soy İsim"
            onChangeText={(text) => setLastName(text)}
            value={lastName}
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            onChangeText={(text) => setEmail(text)}
            value={email}
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            secureTextEntry
            onChangeText={(text) => setPassword(text)}
            value={password}
          />
          <TextInput
            style={styles.input}
            placeholder="Telefon Numarası"
            keyboardType="numeric"
            onChangeText={(text) => setPhoneNumber(text)}
            value={phoneNumber}
          />
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Kayıt Ol</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkText}>Zaten bir hesabım var? Giriş</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
