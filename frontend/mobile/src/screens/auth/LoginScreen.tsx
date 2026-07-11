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
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Icon from '../../components/Icon';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Email dan password wajib diisi');
    }
    setLoading(true);
    try {
      const res: any = await api.login(email, password);
      await login(res.token, res.user);
    } catch (e: any) {
      Alert.alert('Gagal Login', e.message);
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
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />

          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo-laund-transparant.png')}
              style={styles.logoIcon}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>laundaja</Text>
          </View>

          <Text style={styles.welcomeTitle}>Selamat Datang Kembali</Text>
          <Text style={styles.welcomeSub}>Masuk untuk melanjutkan</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Masuk</Text>
          <Text style={styles.formSubtitle}>Silakan masuk ke akun Anda</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="nama@email.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Masukkan password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Icon name={showPass ? 'eye-slash' : 'eye'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.forgotWrap} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotLink}>Lupa password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              Belum punya akun?{' '}
              <Text style={styles.registerBold}>Daftar sekarang</Text>
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
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 36,
    paddingHorizontal: Spacing.xxl,
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    opacity: 0.10,
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    opacity: 0.06,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.94)',
    marginBottom: Spacing.md,
  },
  logoIcon: { width: 36, height: 36, marginRight: 8, tintColor: '#23395B' },
  logoText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#23395B',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  welcomeSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
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
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
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
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  eyeIcon: { fontSize: 16, marginLeft: Spacing.sm },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  registerLink: { alignItems: 'center', paddingVertical: Spacing.sm },
  registerText: { ...Typography.body, color: Colors.textMuted },
  registerBold: { color: Colors.text, fontWeight: '700' },
});
