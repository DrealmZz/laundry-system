import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import LayananScreen from '../screens/customer/LayananScreen';
import BookingScreen from '../screens/customer/BookingScreen';
import StatusScreen from '../screens/customer/StatusScreen';
import RiwayatScreen from '../screens/customer/RiwayatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ICONS: Record<string, string> = { Beranda: '🏠', Layanan: '👕', Status: '🔍', Riwayat: '📋' };

function CustomerTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONS[route.name]}</Text>,
      tabBarActiveTintColor: '#2563EB',
      tabBarInactiveTintColor: '#9CA3AF',
      headerShown: false,
    })}>
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Layanan" component={LayananScreen} />
      <Tab.Screen name="Status" component={StatusScreen} />
      <Tab.Screen name="Riwayat" component={RiwayatScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Main" component={CustomerTabs} />
            <Stack.Screen name="Booking" component={BookingScreen} options={{ headerShown: true, title: 'Booking' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
