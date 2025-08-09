import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AttendanceScreen from '../components/AttendanceScreen';
import LeaderboardScreen from '../components/LeaderboardScreen';
import ProfileScreen from '../components/ProfileScreen';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({ user, setUser }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#185a9d',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          height: 65,
          paddingBottom: 8,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Attendance') {
            return <Feather name="check-circle" size={28} color={color} />;
          } else if (route.name === 'Leaderboard') {
            return <FontAwesome5 name="trophy" size={24} color={color} solid={focused} />;
          } else if (route.name === 'Profile') {
            return <Feather name="user" size={27} color={color} />;
          }
        },
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600', marginBottom: 4 }
      })}
    >
      <Tab.Screen name="Attendance">
        {() => <AttendanceScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile">
        {() => <ProfileScreen user={user} setUser={setUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}