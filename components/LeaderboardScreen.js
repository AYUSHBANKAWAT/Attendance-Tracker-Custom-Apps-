import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from "react-native";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function LeaderBoardScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const attendanceCol = collection(db, "attendance");
        const snapshot = await getDocs(attendanceCol);
        let board = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const dates = Array.isArray(data.dates) ? data.dates : [];
          board.push({
            id: docSnap.id,
            name: data.name || "User",
            email: data.email || "unknown",
            attendanceDays: dates.length,
          });
        });
        // Sort by attendanceDays descending
        board.sort((a, b) => b.attendanceDays - a.attendanceDays);
        setLeaderboard(board);
      } catch (e) {
        setLeaderboard([]);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Leaderboard</Text>
      {loading ? (
        <ActivityIndicator color="#43cea2" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={[styles.row, index === 0 && styles.firstRow]}>
              <Text style={styles.rank}>{index + 1}</Text>
              <Image source={require("../assets/profile.png")} style={styles.avatar} />
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <Text style={styles.days}>{item.attendanceDays} days</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7fafc", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#185a9d", marginBottom: 10, alignSelf: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 9,
    padding: 12,
    marginVertical: 5,
    elevation: 2,
  },
  firstRow: { backgroundColor: "#e0f7fa" },
  rank: { fontSize: 22, fontWeight: "bold", color: "#43cea2", width: 36, textAlign: "center" },
  avatar: { width: 42, height: 42, borderRadius: 21, marginHorizontal: 10 },
  name: { fontSize: 16, fontWeight: "bold", color: "#185a9d" },
  email: { fontSize: 13, color: "#888" },
  days: { marginLeft: "auto", fontWeight: "bold", fontSize: 18, color: "#43cea2" },
});