// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC56yIfog4ltteIymrOfpiVWb_CXi0ZFwU",
  authDomain: "attendance-tracker-custom.firebaseapp.com",
  projectId: "attendance-tracker-custom",
  storageBucket: "attendance-tracker-custom.firebasestorage.app",
  messagingSenderId: "776198429140",
  appId: "1:776198429140:web:568bd23db8f2c9a5875e41",
  measurementId: "G-3PTQ2KV0B8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app);
const analytics = getAnalytics(app);