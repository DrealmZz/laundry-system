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
  'menunggu konfirmasi',
  'disetujui',
  'penjemputan',
  'penimbangan',
  'menunggu pembayaran',
  'sudah dibayar',
  'diproses',
  'sedang di cuci',
  'sedang di keringkan',
  'sedang di setrika',
  'pencucian selesai',
  'pengiriman',
  'selesai',
];

// Warna konsisten (coklat)
const ACTIVE_COLOR = '#A87A4E';   // Coklat gelap
const INACTIVE_COLOR = '#E8DFD0'; // Cream gelap

// Label untuk setiap status
const STATUS_LABELS: Record<string, string> = {
  'menunggu konfirmasi': 'Menunggu',
  'disetujui': 'Disetujui',
  'penjemputan': 'Dijemput',
  'penimbangan': 'Ditimbang',
  'menunggu pembayaran': 'Bayar',
  'sudah dibayar': 'Dibayar',
  'diproses': 'Diproses',
  'sedang di cuci': 'Dicuci',
  'sedang di keringkan': 'Dikeringkan',
  'sedang di setrika': 'Disetrika',
  'pencucian selesai': 'Selesai Cuci',
  'pengiriman': 'Dikirim',
  'selesai': 'Selesai',
};

function Timeline({ status }: { status: string }) {
  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <View style={styles.timeline}>
      {STATUS_ORDER.map((s, i) => {
        const isActive = i <= currentIdx;
        const label = STATUS_LABELS[s] || s;
        const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
        const isLast = i === STATUS_ORDER.length - 1;

        return (
          <View key={s} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineDot, { backgroundColor: color }]} />
              {!isLast && (
                <View style={[styles.timelineLine, { backgroundColor: color }]} />
              )}
            </View>
            <Text style={[styles.timelineLabel, { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
              {label}
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
      const data: any = await api.getBookings();
      const items = data.items || data;
      const active = items.filter(
        (b: any) => b.status_pesanan !== 'selesai' 
          && b.status_pesanan !== 'pesanan ditolak'
          && b.status_pesanan !== 'pesanan dibatalkan',
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
        keyExtractor={(i) => String(i.id_pemesanan || i.id)}
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
              <Text style={styles.orderService}>{item.nama_layanan || item.service}</Text>
              <StatusBadge status={item.status_pesanan || item.status} isActive={true} />
            </View>

            <View style={styles.orderMetaRow}>
              <Text style={styles.orderMeta}>{item.tanggal_pesanan || item.date}</Text>
              {item.shift && <Text style={styles.orderMeta}>{item.shift}</Text>}
              {item.berat_kg && (
                <Text style={styles.orderMeta}>{item.berat_kg} kg</Text>
              )}
            </View>

            <View style={styles.divider} />

            <Timeline status={item.status_pesanan || item.status} />

            {(item.status_pesanan || item.status) === 'menunggu pembayaran' && (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={() =>
                  (navigation as any).navigate('QrisPayment', {
                    bookingId: item.id_pemesanan || item.id,
                    total: item.total,
                    serviceName: item.nama_layanan || item.service,
                    bookingDate: item.tanggal_pesanan || item.date,
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
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
  },
  timelineLabel: {
    ...Typography.body,
    paddingTop: 0,
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
