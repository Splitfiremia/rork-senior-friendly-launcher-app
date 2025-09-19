import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { LauncherProvider } from "@/hooks/launcher-context";
import { DashboardProvider } from "@/hooks/dashboard-context";
import { AdminProvider } from "@/hooks/admin-context";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="phone-dialer" 
        options={{ 
          presentation: "modal",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: "Family Dashboard",
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="landing" 
        options={{ 
          title: "CareConnect",
          headerShown: false,
        }} 
      />

      <Stack.Screen 
        name="camera" 
        options={{ 
          title: "Camera",
          headerShown: false,
          presentation: "modal",
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <LauncherProvider>
          <DashboardProvider>
            <RootLayoutNav />
          </DashboardProvider>
        </LauncherProvider>
      </AdminProvider>
    </QueryClientProvider>
  );
}