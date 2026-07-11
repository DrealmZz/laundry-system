import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import { formatCurrency } from '../../utils/format';

const RIWAYAT_STATUSES = ['selesai', 'pesanan ditolak', 'pesanan dibatalkan', 'sudah dibayar'];

const SORT_OPTIONS = [
  { key: 'terbaru', label: 'Terbaru' },
  { key: 'termurah', label: 'Termurah' },
  { key: 'termahal', label: 'Termahal' },
];

function getDisplayTotal(item: any): number {
  const totalTransaksi = item.total_transaksi !== null && item.total_transaksi !== undefined
    ? parseFloat(item.total_transaksi) : NaN;
  if (!isNaN(totalTransaksi)) return totalTransaksi;

  const total = typeof item.total === 'number' ? item.total : NaN;
  if (!isNaN(total)) return total;

  if (item.berat_kg && item.harga) {
    const calc = Math.round(parseFloat(item.berat_kg) * parseFloat(item.harga));
    if (!isNaN(calc)) return calc;
  }
  return 0;
}

export default function RiwayatScreen() {
  const { token } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('terbaru');

  const fetchHistory = useCallback(async () => {
    try {
      const data: any = await api.getBookings();
      const items = data.items || data;
      setHistory(
        (Array.isArray(items) ? items : []).filter((b: any) =>
          RIWAYAT_STATUSES.includes(b.status_pesanan),
        ),
      );
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, [fetchHistory]);

  const sorted = [...history].sort((a, b) => {
    switch (sortBy) {
      case 'termurah':
        return getDisplayTotal(a) - getDisplayTotal(b);
      case 'termahal':
        return getDisplayTotal(b) - getDisplayTotal(a);
      default:
        return new Date(b.tanggal_pesanan || 0).getTime() - new Date(a.tanggal_pesanan || 0).getTime();
    }
  });

  const totalSpent = history.reduce((sum, item) => sum + getDisplayTotal(item), 0);

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
        <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
        <Text style={styles.headerSub}>
          {history.length} transaksi • Total {formatCurrency(totalSpent)}
        </Text>
      </View>

      {history.length > 0 && (
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortChip, sortBy === opt.key && styles.sortChipActive]}
              onPress={() => setSortBy(opt.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortText, sortBy === opt.key && styles.sortTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={sorted}
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
        renderItem={({ item }) => {
          const displayTotal = getDisplayTotal(item);
          const hasTransaction = !!item.id_transaksi;
          return (
            <Card style={styles.transactionCard}>
              <View style={styles.txLeft}>
                <View style={styles.txIconBox}>
                  <Icon
                    name={(item.nama_layanan || item.service)?.toLowerCase().includes('koin') ? 'coin' : 'basket'}
                    size={22}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txService}>{item.nama_layanan || item.service}</Text>
                  <Text style={styles.txDate}>
                    {item.tanggal_pesanan || '-'} {item.shift ? `• ${item.shift}` : ''}
                  </Text>
                  {item.berat_kg && (
                    <Text style={styles.txWeight}>{item.berat_kg} kg</Text>
                  )}
                  {hasTransaction && (
                    <View style={styles.txExtra}>
                      {item.nomor_struk && (
                        <Text style={styles.txExtraText}>
                          Struk: {item.nomor_struk}
                        </Text>
                      )}
                      {item.metode_pembayaran && (
                        <Text style={styles.txExtraText}>
                          Bayar: {item.metode_pembayaran.toUpperCase()}
                        </Text>
                      )}
                    </View>
                  )}
                  {item.catatan && (
                    <Text style={styles.txNote}>Catatan: {item.catatan}</Text>
                  )}
                </View>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txTotal}>
                  {formatCurrency(displayTotal)}
                </Text>
                <StatusBadge status={item.status_pesanan} />
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            iconName="inbox"
            title="Belum ada riwayat"
            message="Transaksi yang sudah selesai akan muncul di sini"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: 56, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  sortRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    gap: Spacing.sm, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  sortChip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
  },
  sortChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  sortText: { ...Typography.captionBold, color: Colors.textMuted },
  sortTextActive: { color: Colors.primary },
  list: { padding: Spacing.xl, paddingBottom: 100 },
  transactionCard: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.md,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: Spacing.md },
  txIconBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  txIcon: { fontSize: 22 },
  txInfo: { flex: 1 },
  txService: { ...Typography.bodyBold, marginBottom: 2 },
  txDate: { ...Typography.small, color: Colors.textMuted },
  txWeight: { ...Typography.small, color: Colors.textMuted, marginTop: 1 },
  txExtra: { marginTop: 2 },
  txExtraText: { ...Typography.small, color: Colors.primary, fontSize: 9 },
  txNote: { ...Typography.small, color: Colors.error, marginTop: 2, fontStyle: 'italic' },
  txRight: { alignItems: 'flex-end', gap: Spacing.xs + 2 },
  txTotal: { fontSize: 16, fontWeight: '700', color: Colors.success },
});
