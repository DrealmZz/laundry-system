import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/theme';

interface ToastProps {
  message: string;
  visible: boolean;
  type?: 'error' | 'success' | 'info';
  onHide: () => void;
  duration?: number;
}

const ICONS = {
  error: '!',
  success: '\u2713',
  info: 'i',
};

const BG = {
  error: '#DC2626',
  success: '#059669',
  info: Colors.secondary,
};

export default function Toast({
  message,
  visible,
  type = 'error',
  onHide,
  duration = 3000,
}: ToastProps) {
  const slideAnim = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 100,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -80,
          duration: 250,
          useNativeDriver: true,
        }).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide, slideAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: BG[type], transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.icon}>{ICONS[type]}</Text>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    zIndex: 9999,
    ...Shadows.lg,
  },
  icon: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.20)',
    textAlign: 'center',
    lineHeight: 24,
    overflow: 'hidden',
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 18,
  },
});
