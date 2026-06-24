import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLOR: Record<string, string> = {
  menunggu_konfirmasi: '#F59E0B',
  dikonfirmasi: '#3B82F6',
  diproses: '#8B5CF6',
  selesai: '#10B981',
  ditolak: '#EF4444',
};

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, {user?.name} 👋</Text>
          <Text style={styles.sub}>Apa yang bisa kami bantu hari ini?</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Keluar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {[
          { label: 'Layanan', icon: '👕', screen: 'Layanan' },
          { label: 'Booking', icon: '📅', screen: 'Booking' },
          { label: 'Status', icon: '🔍', screen: 'Status' },
          { label: 'Riwayat', icon: '📋', screen: 'Riwayat' },
        ].map(item => (
          <TouchableOpacity key={item.screen} style={styles.card} onPress={() => navigation.navigate(item.screen)}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.cardLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Pesanan Aktif</Text>
      <View style={styles.activeOrder}>
        <Text style={styles.orderService}>Kiloan Express</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR['diproses'] }]}>
          <Text style={styles.badgeText}>Diproses</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 56, backgroundColor: '#2563EB', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  sub: { fontSize: 13, color: '#BFDBFE', marginTop: 2 },
  logout: { color: '#BFDBFE', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12, marginTop: 16 },
  card: { width: '46%', backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', elevation: 2 },
  icon: { fontSize: 32, marginBottom: 8 },
  cardLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginHorizontal: 16, marginTop: 8, marginBottom: 8 },
  activeOrder: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  orderService: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
