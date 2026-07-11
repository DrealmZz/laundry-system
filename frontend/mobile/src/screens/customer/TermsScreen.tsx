import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import Icon from '../../components/Icon';

const TERMS_SECTIONS = [
  {
    title: '1. Layanan',
    body: 'Kami menyediakan jasa pencucian pakaian dengan sistem kiloan dan koin. Harga dan estimasi waktu dapat berubah tanpa pemberitahuan sebelumnya.',
  },
  {
    title: '2. Pesanan',
    body: 'Pesanan dianggap sah setelah customer mengisi data dan mendapatkan nomor antrian. Pembatalan hanya dapat dilakukan sebelum status "Disetujui".',
  },
  {
    title: '3. Pembayaran',
    body: 'Pembayaran dapat dilakukan secara tunai atau non-tunai (QRIS). Pelunasan dilakukan setelah pencucian selesai dan sebelum pengiriman/penjemputan.',
  },
  {
    title: '4. Pengiriman',
    body: 'Customer dapat mengatur jadwal pengiriman setelah status "Pencucian Selesai". Keterlambatan pengiriman bukan tanggung jawab pihak laundry.',
  },
  {
    title: '5. Kerusakan & Kehilangan',
    body: 'Kami tidak bertanggung jawab atas kerusakan akibat pemakaian normal, kelunturan warna, atau barang yang tertinggal di saku. Laporan kehilangan/kerusakan harus disampaikan maksimal 1x24 jam setelah pakaian diterima.',
  },
  {
    title: '6. Uang Jaminan',
    body: 'Untuk layanan tertentu, customer wajib membayar uang jaminan yang akan dikembalikan setelah pakaian diterima dengan kondisi baik.',
  },
  {
    title: '7. Privasi',
    body: 'Data pribadi customer hanya digunakan untuk kepentingan layanan dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan.',
  },
];

export default function TermsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Syarat & Ketentuan</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Dengan menggunakan layanan Laundry Kita, Anda menyetujui syarat dan ketentuan berikut:
        </Text>

        {TERMS_SECTIONS.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          Terakhir diperbarui: Juli 2026
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  backBtn: { width: 32 },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  content: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  intro: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
