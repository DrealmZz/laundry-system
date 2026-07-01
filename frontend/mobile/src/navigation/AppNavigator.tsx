import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/theme';
import LoadingScreen from '../components/LoadingScreen';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import LayananScreen from '../screens/customer/LayananScreen';
import BookingScreen from '../screens/customer/BookingScreen';
import BookingKoinScreen from '../screens/customer/BookingKoinScreen';
import AddressScreen from '../screens/customer/AddressScreen';
import StatusScreen from '../screens/customer/StatusScreen';
import RiwayatScreen from '../screens/customer/RiwayatScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import QrisPaymentScreen from '../screens/customer/QrisPaymentScreen';
import TrackingScreen from '../screens/customer/TrackingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

type TabIcon = {
  focused: boolean;
  color: string;
  size: number;
};

const TAB_ICONS: Record<string, string> = {
  Beranda: '🏠',
  Layanan: '👕',
  Status: '🔍',
  Riwayat: '📋',
  Profil: '👤',
};

function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  return (
    <View style={[tabStyles.iconContainer, focused && tabStyles.iconContainerActive]}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>
        {TAB_ICONS[routeName]}
      </Text>
    </View>
  );
}

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon routeName={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: tabStyles.tabBar,
        tabBarLabelStyle: tabStyles.tabLabel,
        tabBarLabel: route.name,
      })}
    >
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Layanan" component={LayananScreen} />
      <Tab.Screen name="Status" component={StatusScreen} />
      <Tab.Screen name="Riwayat" component={RiwayatScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading } = useAuth();
  const [forceReady, setForceReady] = useState(false);
  const [showDemoLoading, setShowDemoLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setForceReady(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowDemoLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading && !forceReady) {
    return <LoadingScreen message="Memuat aplikasi..." />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Main" component={CustomerTabs} />
            <Stack.Screen
              name="Booking"
              component={BookingScreen}
              options={{
                headerShown: true,
                title: 'Booking Layanan',
                headerTintColor: Colors.primary,
                headerStyle: { backgroundColor: Colors.surface },
                headerShadowVisible: false,
                headerTitleStyle: {
                  fontWeight: '600',
                  fontSize: 17,
                },
              }}
            />
            <Stack.Screen
              name="BookingKoin"
              component={BookingKoinScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Address"
              component={AddressScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="QrisPayment"
              component={QrisPaymentScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Tracking"
              component={TrackingScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
      <LoadingScreen visible={showDemoLoading} overlay message="Mencuci..." />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm + 2,
    height: 65,
    ...Shadows.sm,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: Colors.primaryLight,
  },
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
});
