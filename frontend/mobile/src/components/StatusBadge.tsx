import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  menunggu_konfirmasi: {
    label: 'Menunggu Konfirmasi',
    bg: Colors.warningLight,
    text: Colors.warning,
    dot: Colors.warning,
  },
  dikonfirmasi: {
    label: 'Dikonfirmasi',
    bg: Colors.primaryLight,
    text: Colors.primary,
    dot: Colors.primary,
  },
  diproses: {
    label: 'Sedang Diproses',
    bg: '#F3E8FF',
    text: '#7C3AED',
    dot: '#7C3AED',
  },
  selesai: {
    label: 'Selesai',
    bg: Colors.successLight,
    text: Colors.success,
    dot: Colors.success,
  },
  ditolak: {
    label: 'Ditolak',
    bg: Colors.errorLight,
    text: Colors.error,
    dot: Colors.error,
  },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: Colors.borderLight,
    text: Colors.textMuted,
    dot: Colors.textMuted,
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

export function getStatusLabel(status: string): string {
  return STATUS_CONFIG[status]?.label || status;
}

export function getStatusColor(status: string): string {
  return STATUS_CONFIG[status]?.text || Colors.textMuted;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: Spacing.xs + 2,
  },
  text: {
    ...Typography.small,
    fontWeight: '600',
  },
});
