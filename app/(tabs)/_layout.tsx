import { Tabs } from "expo-router";
import { Home, Users, Settings, Grid3x3, Gamepad2, Bell } from "lucide-react-native";
import React from "react";
import { COLORS } from "@/constants/launcher-config";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color, size }) => <Users color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          title: "All Apps",
          tabBarIcon: ({ color, size }) => <Grid3x3 color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: "Reminders",
          tabBarIcon: ({ color, size }) => <Bell color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="entertainment"
        options={{
          title: "Fun",
          tabBarIcon: ({ color, size }) => <Gamepad2 color={color} size={28} />,
        }}
      />
    </Tabs>
  );
}