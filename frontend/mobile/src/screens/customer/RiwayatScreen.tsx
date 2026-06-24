import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function RiwayatScreen() {
  const { token } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBookings(token!).then((data: any) => {
      setHistory(data.filter((b: any) => b.status === 'selesai'));
      setLoading(false);
    });
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#2563EB" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Riwayat Transaksi</Text>
      <FlatList data={history} keyExtractor={i => String(i.id)} renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.service}>{item.service}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
          <Text style={styles.total}>Rp {item.total.toLocaleString('id-ID')}</Text>
        </View>
      )} ListEmptyComponent={<Text style={styles.empty}>Belum ada riwayat transaksi</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  service: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  date: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  total: { fontSize: 15, fontWeight: 'bold', color: '#10B981' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
});
