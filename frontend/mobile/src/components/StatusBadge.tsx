import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';

// Warna konsisten (coklat)
const STATUS_COLORS = {
  active: '#A87A4E',    // Coklat gelap
  inactive: '#E8DFD0',  // Cream gelap
};

// Label untuk setiap status
const STATUS_LABELS: Record<string, string> = {
  'menunggu konfirmasi': 'Menunggu Konfirmasi',
  'disetujui': 'Disetujui',
  'penjemputan': 'Penjemputan',
  'penimbangan': 'Penimbangan',
  'menunggu pembayaran': 'Menunggu Bayar',
  'sudah dibayar': 'Sudah Dibayar',
  'diproses': 'Diproses',
  'sedang di cuci': 'Sedang Dicuci',
  'sedang di keringkan': 'Sedang Dikeringkan',
  'sedang di setrika': 'Sedang Disetrika',
  'pencucian selesai': 'Cucian Selesai',
  'pengiriman': 'Pengiriman',
  'selesai': 'Selesai',
  'pesanan ditolak': 'Ditolak',
  'pesanan dibatalkan': 'Dibatalkan',
};

interface StatusBadgeProps {
  status: string;
  isActive?: boolean;
}

export default function StatusBadge({ status, isActive = true }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] || status;
  const color = isActive ? STATUS_COLORS.active : STATUS_COLORS.inactive;

  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color: color }]}>{label}</Text>
    </View>
  );
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

export function getStatusColor(status: string): string {
  return STATUS_COLORS.active;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    alignSelf: 'flex-start',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    ...Typography.small,
    fontWeight: '600',
  },
});
