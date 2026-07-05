import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

const SERVICES = [
  {
    id: 1,
    icon: '👕',
    title: 'Laundry Kiloan',
    desc: 'Reguler 2-3 hari / Express 6 jam',
    badge: 'Populer',
    color: Colors.secondary,
  },
  {
    id: 2,
    icon: '🪙',
    title: 'Laundry Koin Self-Service',
    desc: 'Cuci sendiri, hemat & praktis',
    badge: 'Self-Service',
    color: '#2D4E7A',
  },
];

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

  const fetchData = async () => {
    try {
      const data: any = await api.getBookings('');
      setBookings(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const activeBookings = bookings.filter(
    (b) => b.status !== 'selesai' && b.status !== 'ditolak',
  );

  const orderSteps = [
    { label: 'Pickup', done: true },
    { label: 'Dicuci', done: true },
    { label: 'Kering', done: true },
    { label: 'Setrika', done: false },
    { label: 'Selesai', done: false },
  ];
  const doneCount = orderSteps.filter((s) => s.done).length;
  const pct = (doneCount / orderSteps.length) * 100;

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
          <Image
            source={require('../../../assets/logo_laundry.png')}
            style={styles.logo}
            resizeMode="contain"
          />
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
          Halo, {user?.nama_lengkap?.split(' ')[0] || 'User'} 👋
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
            <Text style={styles.searchIconText}>✨</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Layanan Kami</Text>
        {filteredServices.length === 0 ? (
          <View style={styles.emptySearch}>
            <Text style={styles.emptySearchIcon}>🔍</Text>
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
              <Text style={styles.serviceIcon}>{s.icon}</Text>
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
          <View style={styles.activeOrderCard}>
            <View style={styles.activeOrderHeader}>
              <View>
                <Text style={styles.orderLabel}>No. Pesanan</Text>
                <Text style={styles.orderNumber}>#LDJ-20260629-047</Text>
              </View>
              <View style={styles.orderStatusRow}>
                <View style={styles.orderStatusDot} />
                <Text style={styles.orderStatusText}>Dalam Proses</Text>
              </View>
            </View>
            <View style={styles.orderBody}>
              <View style={styles.orderInfoRow}>
                <View style={styles.orderInfoLeft}>
                  <Text style={styles.orderServiceName}>Kiloan Reguler · 4.2 kg</Text>
                </View>
                <Text style={styles.orderEst}>Est. 30 Jun 2026</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${pct}%` }]} />
              </View>
              <View style={styles.stepsRow}>
                {orderSteps.map((step, i) => (
                  <View key={i} style={styles.stepItem}>
                    <Text style={styles.stepDot}>
                      {step.done ? '✅' : i === doneCount ? '⏺️' : '⭕'}
                    </Text>
                    <Text
                      style={[
                        styles.stepLabelText,
                        { color: step.done ? Colors.primary : i === doneCount ? Colors.text : '#B0A68A' },
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
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
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    opacity: 0.10,
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -24,
    left: -24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    opacity: 0.06,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: { width: 96, height: 36, tintColor: '#fff' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: 6,
    right: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  greetingLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.50)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  greetingSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.50)',
    marginTop: 2,
  },
  searchBox: { marginHorizontal: Spacing.xl, marginTop: -16, marginBottom: Spacing.lg },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    ...Shadows.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  searchIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconText: { fontSize: 12 },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  emptySearchIcon: { fontSize: 28, marginBottom: Spacing.sm },
  emptySearchText: { fontSize: 12, color: Colors.textMuted },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  serviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  serviceIcon: { fontSize: 20 },
  serviceInfo: { flex: 1, marginRight: Spacing.md },
  serviceTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  serviceTitle: { fontSize: 12, fontWeight: '600', color: Colors.text },
  serviceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  serviceBadgeText: { fontSize: 9, fontWeight: '700' },
  serviceDesc: { fontSize: 11, color: Colors.textMuted },
  serviceBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  serviceBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  activeOrderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  activeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  orderLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.50)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  orderNumber: { fontSize: 12, fontWeight: '700', color: '#fff' },
  orderStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  orderStatusText: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.80)' },
  orderBody: { padding: Spacing.lg },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orderInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderServiceName: { fontSize: 11, fontWeight: '600', color: Colors.text },
  orderEst: { fontSize: 10, color: Colors.textMuted },
  progressBar: {
    height: 6,
    backgroundColor: '#EDE7CC',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: { fontSize: 14 },
  stepLabelText: { fontSize: 8, fontWeight: '600', textAlign: 'center' },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  promoIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  promoIcon: { fontSize: 18 },
  promoInfo: { flex: 1, marginRight: Spacing.sm },
  promoTag: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  promoTitle: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  promoDesc: { fontSize: 10, marginTop: 1 },
  promoArrow: { fontSize: 20, fontWeight: '300' },
});
