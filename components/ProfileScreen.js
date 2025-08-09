import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, FlatList } from "react-native";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

function getUserDocId(user) {
  return user.email.replace(/[@.]/g, "_");
}

export default function ProfileScreen({ user, setUser }) {
  const [attendanceDays, setAttendanceDays] = useState(0);
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user || !user.email) return;
      setLoading(true);
      try {
        const docRef = doc(db, "attendance", getUserDocId(user));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const dates = Array.isArray(data.dates) ? data.dates : [];
          setAttendanceDays(dates.length);
          setAttendanceDates(dates.sort().reverse());
        } else {
          setAttendanceDays(0);
          setAttendanceDates([]);
        }
      } catch (e) {
        setAttendanceDays(0);
        setAttendanceDates([]);
      }
      setLoading(false);
    };
    fetchProfileData();
  }, [user]);

  const handleLogout = async () => {
    setUser(null);
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/profile.png")} style={styles.avatar} />
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      {loading ? (
        <ActivityIndicator color="#43cea2" style={{ marginTop: 20 }} />
      ) : (
        <>
          <Text style={styles.attendanceText}>Total Attendance Days: <Text style={{fontWeight:'bold'}}>{attendanceDays}</Text></Text>
          <Text style={styles.historyTitle}>Attendance History:</Text>
          <FlatList
            data={attendanceDates}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Text style={styles.historyItem}>{item}</Text>
            )}
            style={styles.historyList}
          />
        </>
      )}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 16, backgroundColor: "#f7fafc" },
  avatar: { width: 100, height: 100, borderRadius: 50, marginVertical: 16 },
  name: { fontSize: 24, fontWeight: "bold", color: "#185a9d", marginBottom: 4 },
  email: { fontSize: 16, color: "#555", marginBottom: 8 },
  attendanceText: { fontSize: 18, marginTop: 16, color: "#185a9d" },
  historyTitle: { fontWeight: "bold", color: "#43cea2", fontSize: 17, marginTop: 20, marginBottom: 6, alignSelf: 'flex-start' },
  historyList: { alignSelf: 'stretch', marginHorizontal: 20 },
  historyItem: { fontSize: 15, paddingVertical: 2, color: "#555" },
  logoutBtn: { marginTop: 34, backgroundColor: "#43cea2", padding: 12, borderRadius: 9 },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});