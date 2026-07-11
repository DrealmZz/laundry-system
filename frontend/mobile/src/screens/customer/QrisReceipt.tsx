import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { formatCurrency } from '../../utils/format';

interface QrisReceiptProps {
  qrisData: string;
  amount: number;
  bookingId: number;
  serviceName: string;
  date: string;
}

const EWALLET_LOGOS = [
  require('../../../assets/template-logo-shopeepay-vector.png'),
  require('../../../assets/Dana-logo.png'),
  require('../../../assets/ovo-ewallet-payment-icon-symbol-free-png.webp'),
  require('../../../assets/gojek-icon-logo-symbol-free-png.webp'),
];

export default function QrisReceipt({
  qrisData,
  amount,
  bookingId,
  serviceName,
  date,
}: QrisReceiptProps) {
  return (
    <View style={styles.container}>
      <View style={styles.receipt}>
        <Image
          source={require('../../../assets/Logo_QRIS.svg.webp')}
          style={styles.qrisLogo}
          resizeMode="contain"
        />

        <View style={styles.qrWrapper}>
          <QRCode
            value={qrisData}
            size={220}
            backgroundColor="white"
            color="#23395B"
          />
        </View>

        <View style={styles.nmidRow}>
          <Text style={styles.nmidLabel}>NMID</Text>
          <Text style={styles.nmidValue}>IDXXXXXXXXXX</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Total Pembayaran</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(amount)}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Pesanan</Text>
            <Text style={styles.infoValue}>#{bookingId || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Layanan</Text>
            <Text style={styles.infoValue}>{serviceName || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>{date || '-'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.acceptedLabel}>Diterima via</Text>
        <View style={styles.ewalletRow}>
          {EWALLET_LOGOS.map((src, i) => (
            <Image key={i} source={src} style={styles.ewalletLogo} resizeMode="contain" />
          ))}
        </View>

        <Text style={styles.footer}>Terima kasih telah menggunakan layanan kami</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  receipt: {
    width: 400,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  qrisLogo: {
    width: 180,
    height: 68,
    marginBottom: 24,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDE7CC',
    marginBottom: 20,
  },
  nmidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  nmidLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: 1,
  },
  nmidValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#23395B',
    letterSpacing: 2,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EDE7CC',
    marginVertical: 16,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8A7D65',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#23395B',
  },
  infoSection: {
    width: '100%',
    gap: 8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#8A7D65',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#23395B',
  },
  acceptedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A7D65',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  ewalletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  ewalletLogo: {
    width: 64,
    height: 28,
  },
  footer: {
    fontSize: 10,
    color: '#8A7D65',
    textAlign: 'center',
    marginTop: 8,
  },
});
