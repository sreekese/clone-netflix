// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjcMpmMRoMIsh4eNsVvJI9liAKuLCSOds",
  authDomain: "netflix-f24ac.firebaseapp.com",
  projectId: "netflix-f24ac",
  storageBucket: "netflix-f24ac.firebasestorage.app",
  messagingSenderId: "715832119481",
  appId: "1:715832119481:web:549c0f48b852e964198b68",
  measurementId: "G-BLENH6L4EC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);