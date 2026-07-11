import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';
import Icon from './Icon';

interface EmptyStateProps {
  icon?: React.ReactNode;
  iconName?: string;
  title: string;
  message?: string;
}

export default function EmptyState({ icon, iconName, title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon}
      {!icon && iconName && <Icon name={iconName} size={48} color={Colors.textMuted} style={styles.icon} />}
      {!icon && !iconName && <Icon name="inbox" size={48} color={Colors.textMuted} style={styles.icon} />}
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xxl,
  },
  icon: { fontSize: 48, marginBottom: Spacing.lg },
  title: {
    ...Typography.h3,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});
