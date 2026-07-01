import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';

const STATUS_ORDER = [
  'menunggu_konfirmasi',
  'dikonfirmasi',
  'menunggu_pembayaran',
  'diproses',
  'selesai',
];

const STATUS_DOTS: Record<string, { label: string; color: string }> = {
  menunggu_konfirmasi: { label: 'Menunggu', color: '#D97706' },
  dikonfirmasi: { label: 'Dikonfirmasi', color: Colors.secondary },
  menunggu_pembayaran: { label: 'Bayar', color: Colors.error },
  diproses: { label: 'Diproses', color: '#7C3AED' },
  selesai: { label: 'Selesai', color: '#059669' },
};

function Timeline({ status }: { status: string }) {
  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <View style={styles.timeline}>
      {STATUS_ORDER.map((s, i) => {
        const dot = STATUS_DOTS[s];
        const isActive = i <= currentIdx;
        const isLast = i === STATUS_ORDER.length - 1;

        return (
          <View key={s} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: isActive ? dot.color : Colors.border },
                ]}
              />
              {!isLast && (
                <View
                  style={[
                    styles.timelineLine,
                    {
                      backgroundColor: i < currentIdx ? dot.color : Colors.border,
                    },
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.timelineLabel,
                {
                  color: isActive ? dot.color : Colors.textMuted,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}
            >
              {dot.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function StatusScreen() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const data: any = await api.getBookings(token!);
      const active = data.filter(
        (b: any) => b.status !== 'selesai' && b.status !== 'ditolak',
      );
      setBookings(active);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Status Cucian</Text>
        <Text style={styles.headerSub}>
          Pantau perkembangan cucian Anda
        </Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => (navigation as any).navigate('Tracking', { item })}>
          <Card style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderService}>{item.service}</Text>
              <StatusBadge status={item.status} />
            </View>

            <View style={styles.orderMetaRow}>
              <Text style={styles.orderMeta}>🗓 {item.date}</Text>
              {item.shift && <Text style={styles.orderMeta}>⏰ {item.shift}</Text>}
              {item.weight && (
                <Text style={styles.orderMeta}>⚖️ {item.weight} kg</Text>
              )}
            </View>

            <View style={styles.divider} />

            <Timeline status={item.status} />

            {item.status === 'menunggu_pembayaran' && item.metode_pembayaran === 'qris' && (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={() =>
                  (navigation as any).navigate('QrisPayment', {
                    bookingId: item.id,
                    total: item.total,
                    serviceName: item.service,
                    bookingDate: item.date,
                  })
                }
                activeOpacity={0.85}
              >
                <Text style={styles.payBtnText}>Bayar Sekarang (QRIS)</Text>
              </TouchableOpacity>
            )}
          </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="📭"
            title="Tidak ada pesanan aktif"
            message="Anda belum memiliki pesanan yang sedang diproses"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  list: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  orderCard: {
    marginBottom: Spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orderService: {
    ...Typography.h3,
    flex: 1,
    marginRight: Spacing.sm,
  },
  orderMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  orderMeta: {
    ...Typography.caption,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 36,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    marginRight: Spacing.md,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
  },
  timelineLabel: {
    ...Typography.body,
    paddingTop: -2,
  },
  payBtn: {
    marginTop: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  payBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
