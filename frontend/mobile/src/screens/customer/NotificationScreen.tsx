import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString('id-ID');
}

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const [notifData, countData] = await Promise.all([
        api.getNotifications(),
        api.getUnreadCount(),
      ]);
      setNotifications(notifData.items || notifData);
      setUnreadCount(countData.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id_notif === id ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, !item.is_read && styles.unread]}
      onPress={() => handleMarkAsRead(item.id_notif)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          {!item.is_read && <View style={styles.badge} />}
          <Text style={styles.title} numberOfLines={1}>
            {item.judul}
          </Text>
        </View>
        <Text style={styles.time}>{formatTime(item.created_at)}</Text>
      </View>
      <Text style={styles.message} numberOfLines={2}>
        {item.isi_pesan}
      </Text>
      {item.id_pemesanan && (
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => {
            // Navigate to booking detail
            // navigation.navigate('BookingDetail', { id: item.id_pemesanan });
          }}
        >
          <Text style={styles.linkText}>Lihat Pesanan</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={20} color={Colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifikasi</Text>
        {unreadCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id_notif.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            iconName="bell"
            title="Tidak ada notifikasi"
            message="Notifikasi akan muncul di sini"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    backgroundColor: '#fff',
    ...Shadows.sm,
  },
  backBtn: { width: 32 },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  countBadge: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  list: {
    padding: Spacing.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  time: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
  message: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  linkBtn: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
});
