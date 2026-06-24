import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

type Service = { id: number; name: string; price: number; unit: string; desc: string };

export default function LayananScreen({ navigation }: any) {
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getServices(token!).then((data: any) => { setServices(data); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#2563EB" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Layanan Kami</Text>
      <FlatList data={services} keyExtractor={i => String(i.id)} renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.price}>Rp {item.price.toLocaleString('id-ID')}</Text>
            <Text style={styles.unit}>{item.unit}</Text>
            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Booking', { service: item })}>
              <Text style={styles.btnText}>Pesan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: 'row', elevation: 2 },
  name: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  desc: { fontSize: 13, color: '#6B7280' },
  right: { alignItems: 'flex-end', justifyContent: 'space-between' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#2563EB' },
  unit: { fontSize: 11, color: '#9CA3AF' },
  btn: { backgroundColor: '#2563EB', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
