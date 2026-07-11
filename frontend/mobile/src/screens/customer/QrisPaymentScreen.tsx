import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import QrisReceipt from './QrisReceipt';
import { formatCurrency } from '../../utils/format';

export default function QrisPaymentScreen({ route, navigation }: any) {
  const { token } = useAuth();
  const { bookingId, total, serviceName, bookingDate } = route.params || {};

  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [paid, setPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);
  const receiptRef = useRef<any>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchPaymentData();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const data: any = await api.generateQR(bookingId);
      setPaymentData(data);
    } catch {
      setPaymentData({
        id: bookingId || 1,
        qris_data: `laundaja:${bookingId || 1}:${total || 0}:${Date.now()}`,
        total: total || 50000,
        service: serviceName || 'Kiloan Reguler',
        date: bookingDate || new Date().toISOString().split('T')[0],
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    setChecking(true);
    try {
      await api.confirmBookingPayment(bookingId);
      setPaid(true);
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Gagal konfirmasi pembayaran');
    } finally {
      setChecking(false);
    }
  };

  const downloadQR = async () => {
    try {
      if (!receiptRef.current) {
        Alert.alert('Gagal', 'Receipt belum siap');
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Izin Diperlukan',
          'Aplikasi membutuhkan izin akses galeri untuk menyimpan QR Code'
        );
        return;
      }

      const uri = await captureRef(receiptRef.current, {
        format: 'png',
        quality: 1,
      });
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Berhasil', 'QR Code berhasil disimpan ke galeri');
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Gagal menyimpan QR Code');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const amount = paymentData?.total || total || 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Menyiapkan pembayaran...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pembayaran QRIS</Text>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.qrisCard}>
          <View style={styles.qrisHeader}>
            <Text style={styles.qrisLabel}>Scan QRIS ini</Text>
            <Animated.Text style={[styles.qrisPulse, { opacity: pulseAnim }]}>●</Animated.Text>
          </View>

          <View style={styles.qrWrapper}>
            <QRCode
              value={paymentData?.qris_data || `laundaja:${bookingId}:${amount}`}
              size={200}
              backgroundColor="white"
              color={Colors.secondary}
            />
          </View>

          <View style={styles.qrisFooter}>
            <Text style={styles.qrisAmountLabel}>Total Pembayaran</Text>
            <Text style={styles.qrisAmount}>
              {formatCurrency(amount)}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Layanan</Text>
            <Text style={styles.infoValue}>{paymentData?.service || serviceName || '-'}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Pesanan</Text>
            <Text style={styles.infoValue}>#{paymentData?.id_pemesanan || paymentData?.id || bookingId || '-'}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>{paymentData?.date || bookingDate || '-'}</Text>
          </View>
        </View>

        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Sisa waktu pembayaran</Text>
          <Text style={[styles.timerValue, timeLeft < 120 && { color: Colors.error }]}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={styles.timerHint}>
            Scan QRIS menggunakan aplikasi {Platform.OS === 'ios' ? 'm-banking atau e-wallet Anda' : 'Gojek, GoPay, m-banking, atau e-wallet lainnya'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={downloadQR}
          activeOpacity={0.85}
        >
          <Text style={styles.downloadBtnText}>Download QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.checkBtn, checking && styles.checkBtnDisabled]}
          onPress={confirmPayment}
          disabled={checking}
          activeOpacity={0.85}
        >
          {checking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.checkBtnText}>Sudah Bayar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelBtnText}>Batalkan Pembayaran</Text>
        </TouchableOpacity>
      </ScrollView>

      {paid && (
        <Animated.View style={styles.successOverlay}>
          <Animated.View style={styles.successCard}>
            <View style={styles.successIconBox}>
              <Text style={styles.successIcon}>{'\u2713'}</Text>
            </View>
            <Text style={styles.successTitle}>Pembayaran Berhasil</Text>
            <Text style={styles.successDesc}>
              Terima kasih! Pesanan kamu sudah masuk antrian dan akan segera dikerjakan.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => navigation.navigate('Main', { screen: 'Status' })}
              activeOpacity={0.85}
            >
              <Text style={styles.successBtnText}>Lihat Status Pesanan</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      <View ref={receiptRef} collapsable={false} style={styles.receiptHidden}>
        <QrisReceipt
          qrisData={paymentData?.qris_data || `laundaja:${bookingId}:${amount}`}
          amount={amount}
          bookingId={paymentData?.id_pemesanan || paymentData?.id || bookingId}
          serviceName={paymentData?.service || serviceName}
          date={paymentData?.date || bookingDate || ''}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  loadingText: { ...Typography.body, color: Colors.textMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.secondary,
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    paddingBottom: 40,
  },
  qrisCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border + '22',
    ...Shadows.md,
    marginBottom: Spacing.lg,
  },
  qrisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  qrisLabel: {
    ...Typography.captionBold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  qrisPulse: { fontSize: 10, color: Colors.success },
  qrWrapper: {
    padding: Spacing.lg,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  qrisFooter: { alignItems: 'center', gap: 4 },
  qrisAmountLabel: { ...Typography.caption, fontSize: 11, color: Colors.textMuted },
  qrisAmount: {
    ...Typography.h1,
    fontSize: 28,
    color: Colors.secondary,
    fontWeight: '800',
  },
  infoCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: { ...Typography.caption, color: Colors.textMuted },
  infoValue: { ...Typography.captionBold, color: Colors.text, fontWeight: '600' },
  infoDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 4 },
  timerCard: {
    width: '100%',
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.warning + '20',
    marginBottom: Spacing.xl,
  },
  timerLabel: { ...Typography.caption, color: Colors.textMuted, fontSize: 11 },
  timerValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  timerHint: { ...Typography.small, textAlign: 'center', color: Colors.textMuted, lineHeight: 16 },
  downloadBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  downloadBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  checkBtn: {
    width: '100%',
    height: 56,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  checkBtnDisabled: { opacity: 0.6 },
  checkBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  cancelBtn: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  cancelBtnText: { ...Typography.body, color: Colors.textMuted, fontWeight: '600' },
  receiptHidden: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    zIndex: 999,
  },
  successCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.xxl + Spacing.lg,
    alignItems: 'center',
    ...Shadows.lg,
  },
  successIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.success + '18',
    borderWidth: 2,
    borderColor: Colors.success + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successIcon: { fontSize: 24, fontWeight: '800', color: Colors.success },
  successTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  successDesc: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginTop: Spacing.sm },
  successBtn: {
    width: '100%',
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  successBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
