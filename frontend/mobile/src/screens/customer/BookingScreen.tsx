import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const SHIFTS = ['Pagi (07-11)', 'Siang (11-15)', 'Sore (15-19)'];
const COIN_TYPES = ['Cuci Saja', 'Cuci & Kering'];

export default function BookingScreen({ route, navigation }: any) {
  const { token } = useAuth();
  const preselected = route.params?.service;
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [shift, setShift] = useState('');
  const [coinType, setCoinType] = useState('');
  const [loading, setLoading] = useState(false);
  const isKoin = preselected?.name?.toLowerCase().includes('koin');

  const handleBooking = async () => {
    if (!date || !shift) return Alert.alert('Error', 'Tanggal dan shift wajib dipilih');
    if (!isKoin && !address) return Alert.alert('Error', 'Alamat wajib diisi untuk layanan kiloan');
    setLoading(true);
    try {
      await api.createBooking(token!, { serviceId: preselected?.id, date, shift, address, coinType });
      Alert.alert('Berhasil!', 'Booking berhasil dibuat, menunggu konfirmasi admin.', [
        { text: 'OK', onPress: () => navigation.navigate('Status') },
      ]);
    } catch (e: any) {
      Alert.alert('Gagal', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Booking Layanan</Text>

      {preselected && (
        <View style={styles.serviceBox}>
          <Text style={styles.serviceLabel}>Layanan dipilih</Text>
          <Text style={styles.serviceName}>{preselected.name}</Text>
        </View>
      )}

      <Text style={styles.label}>Tanggal</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />

      <Text style={styles.label}>Shift</Text>
      <View style={styles.row}>
        {SHIFTS.map(s => (
          <TouchableOpacity key={s} style={[styles.chip, shift === s && styles.chipActive]} onPress={() => setShift(s)}>
            <Text style={[styles.chipText, shift === s && styles.chipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isKoin && (
        <>
          <Text style={styles.label}>Jenis Pencucian</Text>
          <View style={styles.row}>
            {COIN_TYPES.map(t => (
              <TouchableOpacity key={t} style={[styles.chip, coinType === t && styles.chipActive]} onPress={() => setCoinType(t)}>
                <Text style={[styles.chipText, coinType === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {!isKoin && (
        <>
          <Text style={styles.label}>Alamat Penjemputan</Text>
          <TextInput style={[styles.input, { height: 80 }]} placeholder="Masukkan alamat lengkap" value={address}
            onChangeText={setAddress} multiline />
        </>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleBooking} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Konfirmasi Booking</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F9FAFB', flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 20, marginTop: 8 },
  serviceBox: { backgroundColor: '#EFF6FF', borderRadius: 10, padding: 14, marginBottom: 20 },
  serviceLabel: { fontSize: 12, color: '#6B7280' },
  serviceName: { fontSize: 16, fontWeight: '700', color: '#2563EB' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 13, marginBottom: 16, backgroundColor: '#fff', fontSize: 15 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  btn: { backgroundColor: '#2563EB', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
