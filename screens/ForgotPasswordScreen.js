import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const isValidEmail = (email) => {
    // E-posta geçerliliğini kontrol etmek için 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    try {
      const auth = getAuth();

      // E-posta geçerliliğini kontrol et
      if (!isValidEmail(email)) {
        Alert.alert('Hata', 'Geçersiz bir e-posta adresi girdiniz.');
        return;
      }

      await sendPasswordResetEmail(auth, email);

      Alert.alert('Başarılı', 'Şifre sıfırlama e-postası gönderildi.');
      navigation.goBack();
    } catch (error) {
      console.error('Firebase Hata:', error.message);
      Alert.alert('Hata', 'Şifre sıfırlama işlemi sırasında bir hata oluştu.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Şifreyi Sıfırla</Text>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            onChangeText={(text) => setEmail(text)}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
            <Text style={styles.resetButtonText}>Sıfırlama E-postası Gönder</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2855AE', // Background color if needed
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF', // Or a preferred color for the title
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    marginBottom: 16,
    paddingLeft: 10,
  },
  resetButton: {
    backgroundColor: '#7292CF', // Or a preferred color for the button
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
  },
  resetButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default ForgotPasswordScreen;
