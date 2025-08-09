import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function AuthScreen({ setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        setUser({ email: userCredential.user.email, name });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser({ email: userCredential.user.email, name: userCredential.user.displayName });
      }
    } catch (e) {
      setError(e.message.replace("Firebase: ", ""));
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.outer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Image source={require('../assets/attendance.png')} style={styles.logo} />
        <Text style={styles.title}>{isRegister ? 'Create Account' : 'Welcome Back!'}</Text>
        <Text style={styles.subtitle}>{isRegister ? 'Sign up to get started' : 'Login to your account'}</Text>
        {isRegister && (
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#8e9eab"
          />
        )}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor="#8e9eab"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#8e9eab"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isRegister ? 'Sign Up' : 'Login'}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
          <Text style={styles.link}>
            {isRegister ? 'Already have an account? Login' : `Don't have an account? Sign Up`}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 18,
    margin: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#185a9d',
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 5,
  },
  subtitle: {
    color: '#43cea2',
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#43cea2',
    backgroundColor: '#f4f7fa',
    marginBottom: 14,
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: '#185a9d',
  },
  button: {
    backgroundColor: '#43cea2',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#43cea2',
    shadowOpacity: 0.19,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 1,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 15,
  },
  link: {
    color: '#185a9d',
    marginTop: 18,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },
});