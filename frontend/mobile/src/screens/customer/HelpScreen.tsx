import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import Icon from '../../components/Icon';

const CONTACTS = [
  {
    icon: 'whatsapp',
    label: 'WhatsApp Admin',
    value: '+62 812-3456-7890',
    action: 'https://wa.me/6281234567890',
  },
  {
    icon: 'mail',
    label: 'Email',
    value: 'cs@laundrykita.com',
    action: 'mailto:cs@laundrykita.com',
  },
  {
    icon: 'phone',
    label: 'Telepon Outlet',
    value: '(021) 1234-5678',
    action: 'tel:+622112345678',
  },
  {
    icon: 'map-pin',
    label: 'Alamat Outlet',
    value: 'Jl. Merdeka No. 123, Jakarta',
    action: null,
  },
];

const FAQS = [
  {
    q: 'Berapa lama proses laundry kiloan?',
    a: 'Proses laundry kiloan biasanya selesai dalam 1-2 hari kerja setelah penimbangan, tergantung antrian.',
  },
  {
    q: 'Apakah ada layanan antar-jemput?',
    a: 'Ya, kami menyediakan layanan antar-jemput gratis untuk area tertentu. Silakan atur jadwal pengiriman melalui menu Tracking.',
  },
  {
    q: 'Bagaimana cara membatalkan pesanan?',
    a: 'Anda dapat membatalkan pesanan selama status masih "Menunggu Konfirmasi" melalui halaman Tracking.',
  },
  {
    q: 'Apakah uang jaminan bisa dikembalikan?',
    a: 'Uang jaminan akan dikembalikan setelah pakaian selesai diambil/diterima, dikurangi biaya jika ada.',
  },
];

export default function HelpScreen() {
  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pusat Bantuan</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Hubungi Kami</Text>

        {CONTACTS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.contactCard}
            activeOpacity={item.action ? 0.7 : 1}
            onPress={() => {
              if (item.action) {
                Linking.openURL(item.action);
              }
            }}
          >
            <View style={styles.contactIconBox}>
              <Icon name={item.icon} size={18} color={Colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{item.label}</Text>
              <Text style={styles.contactValue}>{item.value}</Text>
            </View>
            {item.action && (
              <Icon name="external-link" size={14} color={Colors.textMuted} />
            )}
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Pertanyaan Umum (FAQ)</Text>

        {FAQS.map((faq, i) => {
          const isOpen = expandedIndex === i;
          return (
            <TouchableOpacity
              key={i}
              style={styles.faqCard}
              activeOpacity={0.7}
              onPress={() => setExpandedIndex(isOpen ? null : i)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
              </View>
              {isOpen && (
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          );
        })}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  contactIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: 12, color: Colors.textMuted },
  contactValue: { fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: 2 },
  faqCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.text, marginRight: Spacing.sm },
  faqAnswer: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
});
