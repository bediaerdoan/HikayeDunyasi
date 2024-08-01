import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert, ScrollView, Switch } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import firebase from '../firebase';

const ProfileScreen = ({ navigation }) => {
  const user = firebase.auth().currentUser;
  const [showProfileInfoOptions, setShowProfileInfoOptions] = useState(false);
  const [showPasswordChangeOptions, setShowPasswordChangeOptions] = useState(false);
  const [username, setUsername] = useState(user.displayName || '');
  const [email, setEmail] = useState(user.email);
  const [profilePicture, setProfilePicture] = useState(user.photoURL || '');
  const [newEmail, setNewEmail] = useState(user.email);
  const [newUsername, setNewUsername] = useState(user.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isFaceIDEnabled, setIsFaceIDEnabled] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Uygulamanın galeriye erişim izni yok");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      const uri = pickerResult.assets[0].uri;
      if (uri && uri.startsWith('file://')) {
        try {
          const uploadUrl = await uploadImageAsync(uri);
          if (uploadUrl) {
            setProfilePicture(uploadUrl);
            await user.updateProfile({ photoURL: uploadUrl });
            alert('Profil resmi güncellendi');
          } else {
            alert('Resim yüklenemedi');
          }
        } catch (error) {
          alert('Profil resmi güncellenemedi: ' + error.message);
        }
      } else {
        alert('Geçersiz resim URI\'si');
      }
    } else {
      alert('Resim seçme işlemi iptal edildi.');
    }
  };

  const uploadImageAsync = async (uri) => {
    if (!uri) {
      throw new Error('Resim URL\'si boş olamaz');
    }

    try {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          resolve(xhr.response);
        };
        xhr.onerror = function() {
          reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      const ref = firebase.storage().ref().child(`profile_pictures/${user.uid}`);
      const snapshot = await ref.put(blob);

      blob.close();

      const downloadURL = await snapshot.ref.getDownloadURL();
      return downloadURL;
    } catch (error) {
      throw new Error('Resim yükleme işlemi başarısız oldu: ' + error.message);
    }
  };

  const handleSignOut = () => {
    firebase.auth().signOut().catch((error) => alert('Çıkış yaparken bir hata oluştu lütfen tekrar deneyin'));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            user.delete().catch((error) => alert('Hesabınız silinemedi lütfen tekrar deneyin'));
          }
        }
      ]
    );
  };

  const reauthenticate = (currentPassword) => {
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    return user.reauthenticateWithCredential(credential);
  };

  const sendEmailVerification = async (newEmail) => {
    try {
      const actionCodeSettings = {
        url: 'https://your-app-url.com/verify-email?email=' + newEmail,
        handleCodeInApp: true,
      };
      await firebase.auth().sendSignInLinkToEmail(newEmail, actionCodeSettings);
      alert('Doğrulama e-postası gönderildi. Lütfen yeni e-posta adresinizi doğrulayın.');
      window.localStorage.setItem('emailForSignIn', newEmail);
    } catch (error) {
      alert('Doğrulama e-postası gönderilemedi: ' + error.message);
    }
  };

  const updateProfile = async () => {
    try {
      await reauthenticate(currentPassword);

      if (newUsername !== username) {
        await user.updateProfile({ displayName: newUsername });
        setUsername(newUsername);
        alert('Kullanıcı adı güncellendi');
      }

      if (newEmail !== email) {
        await sendEmailVerification(newEmail);
      }

      if (profilePicture !== user.photoURL) {
        await user.updateProfile({ photoURL: profilePicture });
        alert('Profil resmi güncellendi');
      }

    } catch (error) {
      alert('Profil güncellenemedi: ' + error.message);
    }
  };

  const updatePassword = async () => {
    try {
      await reauthenticate(currentPassword);

      if (newPassword !== confirmNewPassword) {
        alert('Yeni şifreler eşleşmiyor');
        return;
      }

      if (newPassword === currentPassword) {
        alert('Yeni şifre mevcut şifreyle aynı olamaz');
        return;
      }

      await user.updatePassword(newPassword);
      alert('Şifre güncellendi');
    } catch (error) {
      alert('Şifre güncellenemedi: ' + error.message);
    }
  };

  const toggleProfileInfoOptions = () => {
    setShowProfileInfoOptions(!showProfileInfoOptions);
  };

  const togglePasswordChangeOptions = () => {
    setShowPasswordChangeOptions(!showPasswordChangeOptions);
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    header: {
      backgroundColor: '#2855AE',
      padding: 20,
      paddingTop: 115,
      alignItems: 'center',
    },
    headerContent: {
      alignItems: 'center',
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: 10,
    },
    profileName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#fff',
    },
    profileEmail: {
      fontSize: 16,
      color: '#fff',
    },
    settingsContainer: {
      padding: 20,
    },
    settingsItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    settingsText: {
      fontSize: 16,
      color: '#333',
    },
    switch: {
      marginLeft: 'auto',
    },
    button: {
      backgroundColor: '#007bff',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
      padding: 15,
      marginVertical: 5,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    input: {
      height: 40,
      width: '100%',
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 10,
      backgroundColor: '#fff',
      borderRadius: 5,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#333',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#007bff',
      textAlign: 'center',
      marginTop: 20,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={{ uri: profilePicture || 'https://www.w3schools.com/w3images/avatar2.png' }}
            style={styles.profileImage}
          />
          <TouchableOpacity onPress={pickImage}>
            <Text style={{ color: '#fff', marginBottom: 10 }}>Profil Resmini Değiştir</Text>
          </TouchableOpacity>
          <Text style={styles.profileName}>{username}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingsItem} onPress={toggleProfileInfoOptions}>
          <Text style={styles.settingsText}>Profil Bilgileri</Text>
        </TouchableOpacity>

        {showProfileInfoOptions && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Yeni Kullanıcı Adı"
              value={newUsername}
              onChangeText={setNewUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Yeni Email"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Mevcut Şifre"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <TouchableOpacity onPress={updateProfile} style={styles.button}>
              <Text style={styles.buttonText}>Profili Güncelle</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.settingsItem} onPress={togglePasswordChangeOptions}>
          <Text style={styles.settingsText}>Şifre Değiştir</Text>
        </TouchableOpacity>

        {showPasswordChangeOptions && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Mevcut Şifre"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Yeni Şifre"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Yeni Şifreyi Onayla"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
            />
            <TouchableOpacity onPress={updatePassword} style={styles.button}>
              <Text style={styles.buttonText}>Şifreyi Güncelle</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.settingsItem} onPress={handleSignOut}>
          <Text style={[styles.settingsText, { color: '#007bff' }]}>Çıkış Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsItem} onPress={handleDeleteAccount}>
          <Text style={[styles.settingsText, { color: '#ff4d4d' }]}>Hesabı Sil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default ProfileScreen;
