import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

export default function EditProfileScreen({ navigation }: any) {
  const { user, updateProfile, refreshProfile } = useAuth();

  const [namaLengkap, setNamaLengkap] = useState(user?.nama_lengkap || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [noHp, setNoHp] = useState(user?.no_hp || '');
  const [alamat, setAlamat] = useState(user?.alamat || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasSensitiveChange = username !== user?.username || email !== user?.email;
  const wantsPasswordChange = showPasswordSection && newPassword.length > 0;

  const handleSave = async () => {
    if (!namaLengkap.trim() || !username.trim() || !email.trim()) {
      return Alert.alert('Error', 'Nama lengkap, username, dan email wajib diisi.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Alert.alert('Error', 'Format email tidak valid.');
    }

    if (hasSensitiveChange && !currentPassword) {
      return Alert.alert('Error', 'Masukkan password saat ini untuk mengubah username atau email.');
    }

    if (wantsPasswordChange) {
      if (!currentPassword) {
        return Alert.alert('Error', 'Masukkan password saat ini untuk mengganti password.');
      }
      if (newPassword.length < 6) {
        return Alert.alert('Error', 'Password baru minimal 6 karakter.');
      }
      if (newPassword !== confirmPassword) {
        return Alert.alert('Error', 'Konfirmasi password baru tidak cocok.');
      }
    }

    setSaving(true);
    try {
      const profilePayload: Record<string, string> = {
        nama_lengkap: namaLengkap.trim(),
      };

      if (hasSensitiveChange) {
        profilePayload.username = username.trim();
        profilePayload.email = email.trim();
        profilePayload.currentPassword = currentPassword;
      }

      profilePayload.no_hp = noHp.trim();
      profilePayload.alamat = alamat.trim();

      const result = await api.updateProfile(profilePayload);
      const updatedUser = result?.user || result;

      await updateProfile({
        nama_lengkap: updatedUser.nama_lengkap || namaLengkap,
        username: updatedUser.username || username,
        email: updatedUser.email || email,
        no_hp: updatedUser.no_hp || noHp,
        alamat: updatedUser.alamat || alamat,
      });

      if (wantsPasswordChange) {
        await api.changePassword(currentPassword, newPassword);
      }

      await refreshProfile();
      Alert.alert('Berhasil', 'Profil berhasil diperbarui.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Gagal', e.message);
    } finally {
      setSaving(false);
    }
  };

  const passwordSectionChevron = showPasswordSection ? '\u25B2' : '\u25BC';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profil</Text>
            <View style={styles.backBtn} />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informasi Pribadi</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={namaLengkap}
                onChangeText={setNamaLengkap}
                placeholder="Nama lengkap"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="nama@email.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>No. HP</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={noHp}
                onChangeText={setNoHp}
                placeholder="08123456789"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Alamat</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={alamat}
                onChangeText={setAlamat}
                placeholder="Jl. Merdeka No. 10, Jakarta"
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {hasSensitiveChange && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password Saat Ini</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Masukkan password untuk verifikasi"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                />
              </View>
              <Text style={styles.inputHint}>
                Diperlukan untuk mengubah username atau email
              </Text>
            </View>
          )}

          <View style={styles.sectionDivider} />

          <TouchableOpacity
            style={styles.toggleSection}
            onPress={() => setShowPasswordSection(!showPasswordSection)}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleSectionTitle}>Ganti Password</Text>
            <Text style={styles.toggleChevron}>{passwordSectionChevron}</Text>
          </TouchableOpacity>

          {showPasswordSection && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password Saat Ini</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Password saat ini"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password Baru</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Minimal 6 karakter"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Konfirmasi Password Baru</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Ulangi password baru"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry
                  />
                </View>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: '#fff' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  formSection: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
    paddingBottom: 40,
    ...Shadows.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.lg,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xl,
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  toggleSectionTitle: {
    ...Typography.h3,
    marginBottom: 0,
  },
  toggleChevron: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  inputGroup: { marginBottom: Spacing.lg },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.text,
    marginBottom: 6,
  },
  inputHint: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(35,57,91,0.10)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  inputMultiline: {
    minHeight: 60,
    paddingTop: Platform.OS === 'ios' ? 14 : 10,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    ...Shadows.md,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
