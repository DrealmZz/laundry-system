import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const STATUS_COLOR: Record<string, string> = {
  menunggu_konfirmasi: '#F59E0B',
  dikonfirmasi: '#3B82F6',
  diproses: '#8B5CF6',
  selesai: '#10B981',
  ditolak: '#EF4444',
};

const STATUS_LABEL: Record<string, string> = {
  menunggu_konfirmasi: 'Menunggu Konfirmasi',
  dikonfirmasi: 'Dikonfirmasi',
  diproses: 'Sedang Diproses',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

export default function StatusScreen() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBookings(token!).then((data: any) => { setBookings(data); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#2563EB" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Status Cucian</Text>
      <FlatList data={bookings} keyExtractor={i => String(i.id)} renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.service}>{item.service}</Text>
          <Text style={styles.date}>{item.date}</Text>
          <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] || '#6B7280' }]}>
            <Text style={styles.badgeText}>{STATUS_LABEL[item.status] || item.status}</Text>
          </View>
        </View>
      )} ListEmptyComponent={<Text style={styles.empty}>Belum ada pesanan aktif</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  service: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  date: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  badge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
});
