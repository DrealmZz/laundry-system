import React, { useEffect, useState } from 'react';
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

const SORT_OPTIONS = [
  { key: 'terbaru', label: 'Terbaru' },
  { key: 'termurah', label: 'Termurah' },
  { key: 'termahal', label: 'Termahal' },
];

export default function RiwayatScreen() {
  const { token } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('terbaru');

  const fetchHistory = async () => {
    try {
      const data: any = await api.getBookings(token!);
      setHistory(data.filter((b: any) => b.status === 'selesai'));
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const sorted = [...history].sort((a, b) => {
    switch (sortBy) {
      case 'termurah':
        return a.total - b.total;
      case 'termahal':
        return b.total - a.total;
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const totalSpent = history.reduce((sum, item) => sum + (item.total || 0), 0);

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
          {history.length} transaksi • Total Rp {totalSpent.toLocaleString('id-ID')}
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
              <Text
                style={[
                  styles.sortText,
                  sortBy === opt.key && styles.sortTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={sorted}
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
          <Card style={styles.transactionCard}>
            <View style={styles.txLeft}>
              <View style={styles.txIconBox}>
                <Text style={styles.txIcon}>
                  {item.service?.toLowerCase().includes('koin') ? '🪙' : '👕'}
                </Text>
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txService}>{item.service}</Text>
                <Text style={styles.txDate}>
                  🗓 {item.date} {item.shift ? `• ${item.shift}` : ''}
                </Text>
                {item.weight && (
                  <Text style={styles.txWeight}>⚖️ {item.weight} kg</Text>
                )}
              </View>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txTotal}>
                Rp {item.total?.toLocaleString('id-ID')}
              </Text>
              <StatusBadge status={item.status} />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="📭"
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
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sortChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  sortText: {
    ...Typography.captionBold,
    color: Colors.textMuted,
  },
  sortTextActive: {
    color: Colors.primary,
  },
  list: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  txIcon: { fontSize: 22 },
  txInfo: { flex: 1 },
  txService: {
    ...Typography.bodyBold,
    marginBottom: 2,
  },
  txDate: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  txWeight: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 1,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs + 2,
  },
  txTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.success,
  },
});
