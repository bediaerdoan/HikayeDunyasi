import React, { useState } from 'react';
import { View, Image, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValidEmail = (email) => {
    // E-posta geçerliliğini kontrol etmek için 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    try {
      const auth = getAuth();

      // E-posta geçerliliğini kontrol et
      if (!isValidEmail(email)) {
        Alert.alert('Hata', 'Geçersiz bir e-posta adresi girdiniz.');
        return;
      }

      // Şifre uzunluğunu kontrol et
      if (password.length < 6) {
        Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);

      // Başarılı giriş durumunda ana sayfaya yönlendirme
      navigation.replace('Home');
    } catch (error) {
      console.error('Firebase Hata:', error.message);
      Alert.alert('Hata', 'Giriş işlemi sırasında bir hata oluştu.');
    }
  };

  const handleRegisterRedirect = () => {
    navigation.navigate('Register');
  };

  const handleForgotPasswordRedirect = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <Image source={require('../resimler/logo.png')} style={styles.logo} />
            <Text style={styles.title}>Giriş Yap</Text>
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              onChangeText={(text) => setEmail(text)}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              secureTextEntry
              onChangeText={(text) => setPassword(text)}
              value={password}
            />
            <View style={styles.passwordContainer}>
              <TouchableOpacity style={styles.forgotPasswordLink} onPress={handleForgotPasswordRedirect}>
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.registerLink} onPress={handleRegisterRedirect}>
              <Text style={styles.registerLinkText}>Hesabın yok mu? Hemen kayıt ol.</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  logo: {
    width: 300,
    height: 150,
    marginBottom: 90,
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
  passwordContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordLink: {
    marginTop: 5,
  },
  forgotPasswordText: {
    color: '#FFFFFF', // Or a preferred color for the text
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#7292CF', // Or a preferred color for the button
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
  },
  loginButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
  registerLink: {
    marginTop: 10,
  },
  registerLinkText: {
    color: '#FFFFFF', // White color for the "Kayıt Ol" text
    fontSize: 16,
  },
});

export default LoginScreen;
