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
  Image,
  ActivityIndicator,
} from 'react-native';
import { api } from '../../services/api';
import Icon from '../../components/Icon';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

export default function RegisterScreen({ navigation }: any) {
  const [nama_lengkap, setNamaLengkap] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [no_hp, setNoHp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [alamat, setAlamat] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nama_lengkap || !username || !email || !no_hp || !password || !confirmPass) {
      return Alert.alert('Error', 'Semua field wajib diisi');
    }
    if (password !== confirmPass) {
      return Alert.alert('Error', 'Password tidak cocok');
    }
    if (!agreed) {
      return Alert.alert('Error', 'Anda harus menyetujui Syarat & Ketentuan');
    }
    setLoading(true);
    try {
      await api.register(nama_lengkap, username, email, no_hp, password, alamat || undefined);
      Alert.alert('Berhasil', 'Akun berhasil dibuat', [
        { text: 'Login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e: any) {
      Alert.alert('Gagal', e.message);
    } finally {
      setLoading(false);
    }
  };

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
        <View style={styles.topSection}>
          <View style={styles.decoCircle} />

          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerLabel}>Buat Akun</Text>
              <Text style={styles.headerTitle}>Daftar Laundaja</Text>
            </View>
            <View style={styles.miniLogo}>
              <Image
                source={require('../../../assets/logo-laund-transparant.png')}
                style={styles.miniLogoIcon}
                resizeMode="contain"
              />
              <Text style={styles.miniLogoText}>laundaja</Text>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Data Diri & Password</Text>
          <Text style={styles.formSubtitle}>
            Isi data diri dan buat password untuk akun Anda
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="Rania Azzahra"
                placeholderTextColor={Colors.textMuted}
                value={nama_lengkap}
                onChangeText={setNamaLengkap}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="rania123"
                placeholderTextColor={Colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="rania@email.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
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
                placeholder="08xxxxxxxxxx"
                placeholderTextColor={Colors.textMuted}
                value={no_hp}
                onChangeText={setNoHp}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Alamat (Opsional)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="Jl. Merdeka No. 10"
                placeholderTextColor={Colors.textMuted}
                value={alamat}
                onChangeText={setAlamat}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Min. 8 karakter"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Icon name={showPass ? 'eye-slash' : 'eye'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Konfirmasi Password</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Ulangi password"
                placeholderTextColor={Colors.textMuted}
                value={confirmPass}
                onChangeText={setConfirmPass}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Icon name={showConfirm ? 'eye-slash' : 'eye'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, agreed && styles.checkboxActive]}
            >
              {agreed && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              Saya menyetujui{' '}
              <Text style={styles.termsBold}>Syarat & Ketentuan</Text> dan{' '}
              <Text style={styles.termsBold}>Kebijakan Privasi</Text>{' '}
              Laundaja.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>Buat Akun</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Sudah punya akun?{' '}
              <Text style={styles.loginBold}>Masuk</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.secondary },
  scroll: { flexGrow: 1 },
  topSection: {
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: Spacing.xxl,
    overflow: 'hidden',
  },
  decoCircle: {
    position: 'absolute',
    top: -16,
    right: -16,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    opacity: 0.10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
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
  headerTextWrap: { flex: 1 },
  headerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.50)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  miniLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.90)',
  },
  miniLogoIcon: { width: 24, height: 24, marginRight: 4, tintColor: '#23395B' },
  miniLogoText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#23395B',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  formSection: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
    paddingBottom: 40,
    ...Shadows.lg,
  },
  formTitle: { ...Typography.h2, marginBottom: Spacing.xs },
  formSubtitle: { ...Typography.body, marginBottom: Spacing.xxl },
  inputGroup: { marginBottom: Spacing.lg },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.text,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(35,57,91,0.10)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  input: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  eyeIcon: { fontSize: 16, marginLeft: Spacing.sm },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: 'rgba(35,57,91,0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(35,57,91,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkMark: { fontSize: 12, color: '#fff', fontWeight: '700' },
  termsText: { flex: 1, fontSize: 11, lineHeight: 18, color: Colors.textMuted },
  termsBold: { fontWeight: '600', color: Colors.text },
  registerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  registerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  loginLink: { alignItems: 'center', marginTop: Spacing.xl, paddingVertical: Spacing.sm },
  loginText: { ...Typography.body, color: Colors.textMuted },
  loginBold: { color: Colors.text, fontWeight: '700' },
});
