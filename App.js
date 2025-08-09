import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import AuthScreen from './components/AuthScreen';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          uid: firebaseUser.uid,
        });
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      {user ? (
        <BottomTabNavigator user={user} setUser={setUser} />
      ) : (
        <AuthScreen setUser={setUser} />
      )}
    </NavigationContainer>
  );
}