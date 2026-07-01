import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

export default function AddressScreen({ navigation }: any) {
  const { user, updateProfile } = useAuth();
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Alamat tidak boleh kosong.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ address: address.trim() });
      Alert.alert('Berhasil', 'Alamat berhasil disimpan.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Gagal', 'Gagal menyimpan alamat.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Alamat Saya</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <Text style={styles.cardIcon}>📍</Text>
              </View>
              <Text style={styles.cardLabel}>Alamat Domisili</Text>
            </View>
            <Text style={styles.hint}>
              Alamat ini akan otomatis terisi di halaman pemesanan.
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="Masukkan alamat lengkap (nama jalan, nomor, kelurahan, kecamatan, kota)..."
              placeholderTextColor={Colors.textMuted}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Menyimpan...' : 'Simpan Alamat'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 18, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1.5,
    borderColor: Colors.border + '22',
    padding: Spacing.xl,
    ...Shadows.md,
    marginBottom: Spacing.xl,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: { fontSize: 18 },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  hint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    lineHeight: 16,
  },
  textArea: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border + '35',
    backgroundColor: '#FAF7F2',
    padding: Spacing.md,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
    minHeight: 100,
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  saveBtn: {
    height: 56,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
