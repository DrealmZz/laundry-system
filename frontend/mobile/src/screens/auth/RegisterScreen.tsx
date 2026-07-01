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
} from 'react-native';
import { api } from '../../services/api';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

export default function RegisterScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [referral, setReferral] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Perempuan');
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPass) {
      return Alert.alert('Error', 'Semua field wajib diisi');
    }
    if (password !== confirmPass) {
      return Alert.alert('Error', 'Password tidak cocok');
    }
    setLoading(true);
    try {
      await api.register(name, email, phone, password);
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
              onPress={() => (step === 1 ? navigation.goBack() : setStep(1))}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerLabel}>Buat Akun</Text>
              <Text style={styles.headerTitle}>Daftar Laundaja</Text>
            </View>
            <View style={styles.miniLogo}>
              <Image
                source={require('../../../assets/logo_laundry.png')}
                style={styles.miniLogoImg}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.stepRow}>
            {[1, 2].map((s) => (
              <View key={s} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    step >= s && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      step >= s && styles.stepNumberActive,
                    ]}
                  >
                    {step > s ? '✓' : s}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    step >= s && styles.stepLabelActive,
                  ]}
                >
                  {s === 1 ? 'Data Diri' : 'Password'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formTitle}>
            {step === 1 ? 'Data Diri' : 'Buat Password'}
          </Text>
          <Text style={styles.formSubtitle}>
            {step === 1
              ? 'Isi data diri Anda dengan benar'
              : 'Buat password yang aman untuk akun Anda'}
          </Text>

          {step === 1 ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Lengkap</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.input}
                    placeholder="Rania Azzahra"
                    placeholderTextColor={Colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
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
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Jenis Kelamin</Text>
              <View style={styles.genderRow}>
                {(['Laki-laki', 'Perempuan'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderChip,
                      gender === g && styles.genderChipActive,
                    ]}
                    onPress={() => setGender(g)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === g && styles.genderTextActive,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => setStep(2)}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>Lanjut →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
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
                    <Text style={styles.eyeIcon}>
                      {showPass ? '🙈' : '👁️'}
                    </Text>
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
                    <Text style={styles.eyeIcon}>
                      {showConfirm ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Kode Referral{' '}
                  <Text style={styles.optional}>(opsional)</Text>
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan kode referral"
                    placeholderTextColor={Colors.textMuted}
                    value={referral}
                    onChangeText={setReferral}
                    autoCapitalize="characters"
                  />
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

              <View style={styles.registerBtnRow}>
                <TouchableOpacity
                  style={styles.backStepBtn}
                  onPress={() => setStep(1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backStepArrow}>←</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.registerBtn,
                    !agreed && styles.registerBtnDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={!agreed || loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.registerBtnText}>
                    {loading ? 'Memproses...' : 'Buat Akun'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

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
    width: 48,
    height: 30,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  miniLogoImg: { width: 44, height: 26 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: Colors.primary },
  stepNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.40)',
  },
  stepNumberActive: { color: '#fff' },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
  },
  stepLabelActive: { color: 'rgba(255,255,255,0.90)' },
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
  optional: { fontWeight: '400', color: Colors.textMuted },
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
  genderRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xxl },
  genderChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(35,57,91,0.15)',
    alignItems: 'center',
  },
  genderChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  genderTextActive: { color: '#fff' },
  nextBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
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
  registerBtnRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  backStepBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: 'rgba(35,57,91,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backStepArrow: { fontSize: 18, color: Colors.text },
  registerBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  registerBtnDisabled: { backgroundColor: 'rgba(35,57,91,0.10)' },
  registerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  loginLink: { alignItems: 'center', marginTop: Spacing.xl, paddingVertical: Spacing.sm },
  loginText: { ...Typography.body, color: Colors.textMuted },
  loginBold: { color: Colors.text, fontWeight: '700' },
});
