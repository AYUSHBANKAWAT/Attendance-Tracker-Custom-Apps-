import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import * as Location from 'expo-location';

// Utility to get Firestore-safe document ID from email
function getUserDocId(user) {
  return user.email.replace(/[@.]/g, "_");
}

// Haversine formula for distance (in meters) between two lat/lng
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in meters
  return d;
}

// Set your reference location here
const REF_LAT = 28.66732; // example: New Delhi latitude
const REF_LON = 77.165497; // example: New Delhi longitude
const ATTENDANCE_RADIUS_METERS = 500;

export default function AttendanceScreen({ user }) {
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [todayMarked, setTodayMarked] = useState(false);

  // Format today's date as yyyy-MM-dd
  const todayObj = new Date();
  const yyyy = todayObj.getFullYear();
  const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
  const dd = String(todayObj.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;

  const safeArray = (item) => Array.isArray(item) ? item : [];

  const fetchAttendance = async () => {
    if (!user || !user.email) {
      setLoading(false);
      setMarkedDates({});
      setTodayMarked(false);
      return;
    }
    setLoading(true);
    try {
      const docRef = doc(db, "attendance", getUserDocId(user));
      const docSnap = await getDoc(docRef);
      let dates = [];
      if (docSnap.exists()) {
        const data = docSnap.data();
        dates = safeArray(data.dates);
      }
      const marked = {};
      dates.forEach(date => {
        marked[date] = { marked: true, selected: date === today, selectedColor: "#43cea2" };
      });
      setMarkedDates(marked);
      setTodayMarked(dates.indexOf(today) !== -1);
    } catch (e) {
      Alert.alert("Error", "Could not fetch attendance.");
      setMarkedDates({});
      setTodayMarked(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, [user && user.email]);

  const markAttendance = async () => {
    if (!user || !user.email) return;
    setLoading(true);
    try {
      // 1. Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Location permission is required to mark attendance.");
        setLoading(false);
        return;
      }

      // 2. Get current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 3. Calculate distance to reference point
      const distance = getDistanceFromLatLonInMeters(latitude, longitude, REF_LAT, REF_LON);

      if (distance > ATTENDANCE_RADIUS_METERS) {
        Alert.alert(
          "Not at Location",
          `Attendance can only be marked within 500m of the designated location.\n\nYou are currently ${distance.toFixed(1)} meters away.`
        );
        setLoading(false);
        return;
      }

      // 4. Mark attendance as before
      const docRef = doc(db, "attendance", getUserDocId(user));
      const docSnap = await getDoc(docRef);
      let existingDates = [];
      if (docSnap.exists()) {
        const data = docSnap.data();
        existingDates = safeArray(data.dates);
        if (existingDates.indexOf(today) === -1) {
          await updateDoc(docRef, {
            dates: arrayUnion(today),
            name: user.name,
            email: user.email,
          });
        }
      } else {
        await setDoc(docRef, {
          dates: [today],
          name: user.name,
          email: user.email,
        });
      }
      await fetchAttendance();
    } catch (e) {
      Alert.alert("Error", "Could not mark attendance.");
    }
    setLoading(false);
  };

  if (!user || !user.email) {
    return (
      <View style={styles.container}>
        <Text style={styles.greeting}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/checkin.png')} style={styles.heroImage} />
      <Text style={styles.greeting}>Hello, <Text style={{fontWeight:'bold'}}>{user.name || user.email}</Text> 👋</Text>
      <Text style={styles.infoText}>
        {todayMarked
          ? "🎉 You've marked attendance for today!"
          : "Tap the button below to mark your attendance for today"}
      </Text>

      <TouchableOpacity
        style={[styles.button, todayMarked && { backgroundColor: "#a1a1a1" }]}
        onPress={markAttendance}
        disabled={todayMarked || loading}
      >
        <Text style={styles.buttonText}>{todayMarked ? "Attendance Marked" : "Mark Attendance"}</Text>
      </TouchableOpacity>

      <Text style={styles.calendarLabel}>Your Attendance</Text>
      {loading ? (
        <ActivityIndicator color="#43cea2" style={{ marginTop: 20 }} />
      ) : (
        <Calendar
          markedDates={markedDates}
          disableAllTouchEventsForDisabledDays
          theme={{
            todayTextColor: "#185a9d",
            selectedDayBackgroundColor: "#43cea2",
            selectedDayTextColor: "#fff",
            arrowColor: "#185a9d",
            dotColor: "#43cea2",
            textSectionTitleColor: "#185a9d",
          }}
          style={styles.calendar}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 16, backgroundColor:'#f7fafc' },
  heroImage: { width: 100, height: 100, marginTop: 10, marginBottom: 10 },
  greeting: { fontSize: 22, color: '#185a9d', marginBottom: 6 },
  infoText: { fontSize: 16, color: '#555', marginBottom: 18, textAlign: 'center', paddingHorizontal: 18 },
  button: {
    backgroundColor: '#43cea2',
    paddingVertical: 12,
    paddingHorizontal: 38,
    borderRadius: 10,
    shadowColor: '#43cea2',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 18,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  calendar: { marginTop: 10, borderRadius: 14, width: '98%', alignSelf: 'center', padding: 5 },
  calendarLabel: { fontWeight: 'bold', color: '#185a9d', fontSize: 18, marginTop: 18, marginBottom: 6 },
});