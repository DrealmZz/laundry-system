import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { api } from '../../services/api';

export default function RegisterScreen({ navigation }: any) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.phone || !form.password)
      return Alert.alert('Error', 'Semua field wajib diisi');
    setLoading(true);
    try {
      await api.register(form.name, form.email, form.phone, form.password);
      Alert.alert('Berhasil', 'Akun berhasil dibuat', [{ text: 'Login', onPress: () => navigation.navigate('Login') }]);
    } catch (e: any) {
      Alert.alert('Gagal', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Daftar Akun</Text>

      {(['name', 'email', 'phone', 'password'] as const).map(key => (
        <TextInput key={key} style={styles.input}
          placeholder={{ name: 'Nama Lengkap', email: 'Email', phone: 'Nomor HP', password: 'Password' }[key]}
          value={form[key]} onChangeText={v => set(key, v)}
          secureTextEntry={key === 'password'}
          keyboardType={key === 'email' ? 'email-address' : key === 'phone' ? 'phone-pad' : 'default'}
          autoCapitalize="none" />
      ))}

      <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Daftar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Sudah punya akun? <Text style={styles.linkBold}>Masuk</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2563EB', textAlign: 'center', marginBottom: 28 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 15 },
  btn: { backgroundColor: '#2563EB', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', color: '#6B7280' },
  linkBold: { color: '#2563EB', fontWeight: 'bold' },
});
