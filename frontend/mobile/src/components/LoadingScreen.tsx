import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, Platform } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Memuat aplikasi...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo_laundry.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  logo: {
    width: 160,
    height: 70,
  },
  spinner: { marginTop: Spacing.xxl },
  text: { marginTop: Spacing.md, ...Typography.caption, color: Colors.textMuted },
});
