import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Image } from 'react-native';
import firebase from './firebase';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ProfileScreen from './screens/ProfileScreen';
import StoryScreen from './screens/StoryScreen';
import StoryListScreen from './screens/StoryListScreen';
import StoryDetailScreen from './screens/StoryDetailScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';

const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();
const StoryListStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

const AuthStackScreen = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="AnaSayfa" component={HomeScreen} />
    <HomeStack.Screen name="Story" component={StoryScreen} />
  </HomeStack.Navigator>
);

const StoryListStackScreen = () => (
  <StoryListStack.Navigator screenOptions={{ headerShown: false }}>
    <StoryListStack.Screen name="HikayeListesi" component={StoryListScreen} />
    <StoryListStack.Screen name="StoryDetail" component={StoryDetailScreen} />
  </StoryListStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfilScreen" component={ProfileScreen} />
    <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
  </ProfileStack.Navigator>
);

const TabStackScreen = () => (
  <Tab.Navigator
    initialRouteName="AnaSayfaTab"
    activeColor="#000000"
    inactiveColor="#808080"
    barStyle={{ backgroundColor: '#ffffff' }}
  >
    <Tab.Screen
      name="AnaSayfaTab"
      component={HomeStackScreen}
      options={{
        tabBarLabel: 'Ana sayfa',
        tabBarIcon: ({ color }) => (
          <Image source={require('./resimler/home.png')} style={{ width: 26, height: 26 }} />
        ),
      }}
    />
    <Tab.Screen
      name="HikayelerTab"
      component={StoryListStackScreen}
      options={{
        tabBarLabel: 'Hikayeler',
        tabBarIcon: ({ color }) => (
          <Image source={require('./resimler/list.png')} style={{ width: 26, height: 26 }} />
        ),
      }}
    />
    <Tab.Screen
      name="ProfilTab"
      component={ProfileStackScreen}
      options={{
        tabBarLabel: 'Profil',
        tabBarIcon: ({ color }) => (
          <Image source={require('./resimler/person.png')} style={{ width: 26, height: 26 }} />
        ),
      }}
    />
  </Tab.Navigator>
);

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setIsSignedIn(!!user);
    });

    return unsubscribe;
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        {isSignedIn ? <TabStackScreen /> : <AuthStackScreen />}
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
