import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD32N-GopeDMLrXv5rMJNe1bIqJx4PqDI0",
  authDomain: "tez-uygulama-auth.firebaseapp.com",
  projectId: "tez-uygulama-auth",
  storageBucket: "tez-uygulama-auth.appspot.com",
  messagingSenderId: "427385257736",
  appId: "1:427385257736:web:abbed5d4f1a5db40b40af8",
  measurementId: "G-6MKR3QEQ0Q",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
