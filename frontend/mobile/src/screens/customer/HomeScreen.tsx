import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';

const KILOAN_STATUSES = [
  'menunggu konfirmasi',
  'disetujui',
  'penjemputan',
  'penimbangan',
  'menunggu pembayaran',
  'sudah dibayar',
  'diproses',
  'sedang di cuci',
  'sedang di keringkan',
  'sedang di setrika',
  'pencucian selesai',
  'pengiriman',
  'selesai',
];

const KOIN_STATUSES = [
  'menunggu konfirmasi',
  'disetujui',
  'menunggu pembayaran',
  'sudah dibayar',
  'selesai',
];

const KILOAN_LABELS: Record<string, string> = {
  'menunggu konfirmasi': 'Menunggu',
  disetujui: 'Disetujui',
  penjemputan: 'Penjemputan',
  penimbangan: 'Penimbangan',
  'menunggu pembayaran': 'Pembayaran',
  'sudah dibayar': 'Dibayar',
  diproses: 'Diproses',
  'sedang di cuci': 'Dicuci',
  'sedang di keringkan': 'Dikeringkan',
  'sedang di setrika': 'Disetrika',
  'pencucian selesai': 'Selesai Cuci',
  pengiriman: 'Dikirim',
  selesai: 'Selesai',
};

const KOIN_LABELS: Record<string, string> = {
  'menunggu konfirmasi': 'Menunggu',
  disetujui: 'Disetujui',
  'menunggu pembayaran': 'Pembayaran',
  'sudah dibayar': 'Dibayar',
  selesai: 'Selesai',
};

const SERVICES = [
  {
    id: 1,
    icon: 'basket',
    title: 'Laundry Kiloan',
    desc: 'Reguler 2-3 hari / Express 6 jam',
    badge: 'Populer',
    color: Colors.secondary,
  },
  {
    id: 2,
    icon: 'coin',
    title: 'Laundry Koin Self-Service',
    desc: 'Cuci sendiri, hemat & praktis',
    badge: 'Self-Service',
    color: '#2D4E7A',
  },
];

const TERMINAL_STATUSES = ['selesai', 'pesanan ditolak', 'pesanan dibatalkan'];

function getStatusIndex(status: string, isKoin: boolean): number {
  const order = isKoin ? KOIN_STATUSES : KILOAN_STATUSES;
  return order.indexOf(status);
}

function ActiveOrderCard({ booking, onPress }: { booking: any; onPress: () => void }) {
  const isKoin = booking.jenis_pencucian === 'koin';
  const statuses = isKoin ? KOIN_STATUSES : KILOAN_STATUSES;
  const labels = isKoin ? KOIN_LABELS : KILOAN_LABELS;
  const currentIdx = getStatusIndex(booking.status_pesanan, isKoin);
  const progress = currentIdx >= 0 ? (currentIdx / (statuses.length - 1)) * 100 : 0;

  const stepsToShow = isKoin
    ? ['menunggu konfirmasi', 'disetujui', 'menunggu pembayaran', 'sudah dibayar', 'selesai']
    : ['menunggu konfirmasi', 'disetujui', 'penimbangan', 'sudah dibayar', 'diproses', 'pencucian selesai', 'selesai'];

  const dateStr = booking.tanggal_pesanan
    ? booking.tanggal_pesanan.replace(/-/g, '')
    : new Date().toISOString().split('T')[0].replace(/-/g, '');
  const orderId = `LDJ-${dateStr}-${String(booking.id_pemesanan).padStart(3, '0')}`;

  const serviceInfo = booking.nama_layanan || 'Laundry';
  const weight = booking.berat_kg ? ` · ${booking.berat_kg} kg` : '';
  const tanggal = booking.tanggal_pesanan
    ? new Date(booking.tanggal_pesanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <TouchableOpacity style={styles.activeOrderCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.activeOrderHeader}>
        <View>
          <Text style={styles.orderLabel}>No. Pesanan</Text>
          <Text style={styles.orderNumber}>#{orderId}</Text>
        </View>
        <StatusBadge status={booking.status_pesanan} />
      </View>
      <View style={styles.orderBody}>
        <View style={styles.orderInfoRow}>
          <Text style={styles.orderServiceName} numberOfLines={1}>
            {serviceInfo}{weight}
          </Text>
          <Text style={styles.orderEst}>{tanggal}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.max(progress, 4)}%` }]} />
        </View>
        <View style={styles.stepsRow}>
          {stepsToShow.map((s, i) => {
            const stepIdx = statuses.indexOf(s);
            const done = stepIdx >= 0 && stepIdx <= currentIdx;
            const isCurrent = stepIdx === currentIdx;
            const label = labels[s] || s;
            return (
              <View key={i} style={styles.stepItem}>
                <View style={[styles.stepDot, done && styles.stepDotDone, isCurrent && styles.stepDotCurrent]} />
                <Text
                  style={[
                    styles.stepLabelText,
                    { color: done ? Colors.primary : isCurrent ? Colors.text : '#B0A68A' },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filteredServices = SERVICES.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const fetchData = useCallback(async () => {
    try {
      const data: any = await api.getBookings();
      const items = data.items || data;
      setBookings(Array.isArray(items) ? items : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const activeBookings = bookings.filter(
    (b) => !TERMINAL_STATUSES.includes(b.status_pesanan),
  );

  const initials = (user?.nama_lengkap || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />

        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../../assets/logo-laund-transparant.png')}
              style={styles.logoIcon}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>laundaja</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.notifBtn}>
              <View style={styles.notifDot} />
            </View>
            <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profil')} activeOpacity={0.7}>
              <Text style={styles.avatarText}>{initials}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.greetingLabel}>Selamat datang</Text>
        <Text style={styles.greetingName}>
          Halo, {user?.nama_lengkap?.split(' ')[0] || 'User'}
        </Text>
        <Text style={styles.greetingSub}>
          Ada {activeBookings.length} pesanan aktif hari ini
        </Text>
      </View>

      <View style={styles.searchBox}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari layanan laundry..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.searchIcon}>
            <Icon name="search" size={14} color="#fff" />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Layanan Kami</Text>
        {filteredServices.length === 0 ? (
          <View style={styles.emptySearch}>
            <Icon name="search" size={32} color={Colors.textMuted} />
            <Text style={styles.emptySearchText}>
              Layanan "{searchQuery}" tidak ditemukan
            </Text>
          </View>
        ) : filteredServices.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={styles.serviceCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Layanan')}
          >
            <View style={[styles.serviceIconBox, { backgroundColor: s.color + '18' }]}>
              <Icon name={s.icon} size={24} color={s.color} />
            </View>
            <View style={styles.serviceInfo}>
              <View style={styles.serviceTitleRow}>
                <Text style={styles.serviceTitle}>{s.title}</Text>
                <View style={[styles.serviceBadge, { backgroundColor: Colors.primary + '22' }]}>
                  <Text style={[styles.serviceBadgeText, { color: Colors.primary }]}>{s.badge}</Text>
                </View>
              </View>
              <Text style={styles.serviceDesc}>{s.desc}</Text>
            </View>
            <TouchableOpacity
              style={styles.serviceBtn}
              onPress={() => {
                if (s.id === 2) {
                  navigation.navigate('BookingKoin');
                } else {
                  navigation.navigate('Booking', { service: { name: s.title } });
                }
              }}
            >
              <Text style={styles.serviceBtnText}>Pesan</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {activeBookings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pesanan Aktif</Text>
          {activeBookings.map((booking) => (
            <View key={booking.id_pemesanan} style={{ marginBottom: Spacing.md }}>
              <ActiveOrderCard
                booking={booking}
                onPress={() =>
                  (navigation as any).navigate('Tracking', { item: booking })
                }
              />
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute', top: -20, right: -20,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, opacity: 0.10,
  },
  decoCircle2: {
    position: 'absolute', bottom: -24, left: -24,
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primary, opacity: 0.06,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.xl,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 36, height: 36, marginRight: 4, tintColor: '#fff' },
  logoText: {
    fontSize: 26,
    fontWeight: '400',
    color: '#fff',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    letterSpacing: 1,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  notifBtn: {
    width: 36, height: 36, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary,
    position: 'absolute', top: 6, right: 6,
  },
  avatar: {
    width: 36, height: 36, borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  greetingLabel: {
    fontSize: 10, fontWeight: '500',
    color: 'rgba(255,255,255,0.50)',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  greetingName: {
    fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  greetingSub: {
    fontSize: 12, color: 'rgba(255,255,255,0.50)', marginTop: 2,
  },
  searchBox: { marginHorizontal: Spacing.xl, marginTop: -16, marginBottom: Spacing.lg },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    ...Shadows.md,
  },
  searchInput: {
    flex: 1, fontSize: 14, color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  searchIcon: {
    width: 28, height: 28, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  searchIconText: { fontSize: 12 },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  emptySearch: {
    alignItems: 'center', paddingVertical: Spacing.xxl,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, ...Shadows.sm,
  },
  emptySearchIcon: { fontSize: 28, marginBottom: Spacing.sm },
  emptySearchText: { fontSize: 12, color: Colors.textMuted },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.sm,
  },
  serviceIconBox: {
    width: 44, height: 44, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  serviceIcon: { fontSize: 20 },
  serviceInfo: { flex: 1, marginRight: Spacing.md },
  serviceTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  serviceTitle: { fontSize: 12, fontWeight: '600', color: Colors.text },
  serviceBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  serviceBadgeText: { fontSize: 9, fontWeight: '700' },
  serviceDesc: { fontSize: 11, color: Colors.textMuted },
  serviceBtn: {
    backgroundColor: Colors.secondary, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  serviceBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  activeOrderCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    overflow: 'hidden', ...Shadows.md,
  },
  activeOrderHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  orderLabel: {
    fontSize: 9, fontWeight: '500',
    color: 'rgba(255,255,255,0.50)',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  orderNumber: { fontSize: 12, fontWeight: '700', color: '#fff' },
  orderBody: { padding: Spacing.lg },
  orderInfoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  orderServiceName: { fontSize: 11, fontWeight: '600', color: Colors.text, flex: 1 },
  orderEst: { fontSize: 10, color: Colors.textMuted },
  progressBar: {
    height: 6, backgroundColor: '#EDE7CC',
    borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.md,
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepItem: { alignItems: 'center', gap: 4, flex: 1 },
  stepDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#E8DFD0',
  },
  stepDotDone: { backgroundColor: Colors.primary },
  stepDotCurrent: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2, borderColor: Colors.primaryLight,
  },
  stepLabelText: { fontSize: 7, fontWeight: '600', textAlign: 'center' },
});
