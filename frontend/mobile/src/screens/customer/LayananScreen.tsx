import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

const MACHINES = [
  { id: 'A', label: 'Mesin A', kapasitas: '7 kg', status: 'Tersedia' as const },
  { id: 'B', label: 'Mesin B', kapasitas: '10 kg', status: 'Digunakan' as const },
  { id: 'C', label: 'Mesin C', kapasitas: '7 kg', status: 'Maintenance' as const },
];

const KILO_LAYANAN = [
  { id: 'reguler', label: 'Layanan Reguler', estimasi: '2–3 hari', priceLabel: 'Rp 5.000/kg' },
  { id: 'express', label: 'Layanan Express', estimasi: '6 jam', priceLabel: 'Rp 9.000/kg' },
];

const STATUS_COLORS: Record<string, string> = {
  Tersedia: '#166534',
  Digunakan: '#D97706',
  Maintenance: '#DC2626',
};

const STATUS_BG: Record<string, string> = {
  Tersedia: '#EDFAF4',
  Digunakan: '#FFFBEB',
  Maintenance: '#FEF2F2',
};

function MachineStatusCard({ machine }: { machine: typeof MACHINES[0] }) {
  return (
    <View style={styles.machineRow}>
      <View style={styles.machineLeft}>
        <View style={styles.machineDot} />
        <View>
          <Text style={styles.machineLabel}>{machine.label}</Text>
          <Text style={styles.machineKapasitas}>{machine.kapasitas}</Text>
        </View>
      </View>
      <View
        style={[
          styles.machineStatus,
          { backgroundColor: STATUS_BG[machine.status] || '#F5F5F5' },
        ]}
      >
        <Text
          style={[
            styles.machineStatusText,
            { color: STATUS_COLORS[machine.status] || '#666' },
          ]}
        >
          {machine.status}
        </Text>
      </View>
    </View>
  );
}

function KiloServiceCard({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.accentBar} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconBox}>
            <Text style={styles.cardIcon}>🧺</Text>
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDesc}>{description}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subLabel}>Jenis Layanan</Text>
        <View style={styles.layananBox}>
          {KILO_LAYANAN.map((l, i) => (
            <View
              key={l.id}
              style={[styles.layananRow, i < KILO_LAYANAN.length - 1 && styles.layananRowBorder]}
            >
              <View style={styles.checkCircle}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
              <View style={styles.layananInfo}>
                <Text style={styles.layananName}>{l.label}</Text>
                <Text style={styles.layananMeta}>
                  {l.estimasi} · {l.priceLabel}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.cardBtnContainer}>
        <TouchableOpacity style={styles.cardBtn} onPress={onPress} activeOpacity={0.85}>
          <Text style={styles.cardBtnText}>Pilih Layanan</Text>
          <Text style={styles.cardBtnArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function KoinServiceCard({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  const available = MACHINES.filter((m) => m.status === 'Tersedia').length;

  return (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={[styles.accentBar, { backgroundColor: Colors.secondary }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconBox, { backgroundColor: Colors.secondary + '10' }]}>
            <Text style={styles.cardIcon}>🫧</Text>
          </View>
          <View style={styles.cardTitleWrap}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{title}</Text>
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>{available} Tersedia</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>{description}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subLabel}>Status Mesin</Text>
        <View style={styles.layananBox}>
          {MACHINES.map((m, i) => (
            <View key={m.id}>
              <MachineStatusCard machine={m} />
              {i < MACHINES.length - 1 && <View style={styles.machineDivider} />}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.cardBtnContainer}>
        <TouchableOpacity
          style={[styles.cardBtn, { backgroundColor: Colors.secondary }]}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <Text style={styles.cardBtnText}>Booking Mesin</Text>
          <Text style={styles.cardBtnArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function LayananScreen({ navigation }: any) {
  const { token } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchServices = async () => {
    try {
      const data: any = await api.getServices(token!);
      setServices(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

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
        <View style={styles.headerRow}>
          <Image
            source={require('../../../assets/logo_laundry.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={styles.headerChip}>
            <Text style={styles.headerChipText}>Layanan Laundry</Text>
          </View>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerInfoText}>
            Pilih jenis layanan laundry yang ingin digunakan.
          </Text>
        </View>
      </View>

      <View style={styles.cardList}>
        <KiloServiceCard
          title="Laundry Kiloan"
          description="Layanan laundry berdasarkan berat pakaian."
          onPress={() => navigation.navigate('Booking', { service: { name: 'Laundry Kiloan' } })}
        />
        <KoinServiceCard
          title="Laundry Koin"
          description="Layanan laundry mandiri menggunakan mesin."
          onPress={() => navigation.navigate('BookingKoin')}
        />
      </View>

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
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerLogo: { width: 108, height: 40, tintColor: '#fff' },
  headerChip: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerChipText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  headerInfo: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  headerInfoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 18,
  },
  cardList: { padding: Spacing.xl, gap: Spacing.lg },
  serviceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: Colors.border + '28',
    overflow: 'hidden',
    ...Shadows.md,
  },
  accentBar: { height: 4, backgroundColor: Colors.primary, opacity: 0.85 },
  cardBody: { padding: Spacing.xl },
  cardHeader: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.lg },
  cardIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primary + '14',
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: { fontSize: 28 },
  cardTitleWrap: { flex: 1, paddingTop: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  cardDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  availableBadge: {
    backgroundColor: '#EDFAF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  availableText: { fontSize: 10, fontWeight: '700', color: '#166534' },
  divider: { height: 1, backgroundColor: Colors.border + '20', marginBottom: Spacing.lg },
  subLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#B8A88A',
    marginBottom: Spacing.md,
  },
  layananBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  layananRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 6,
  },
  layananRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border + '15' },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    borderWidth: 1.5,
    borderColor: Colors.primary + '50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  layananInfo: { flex: 1 },
  layananName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 18,
  },
  layananMeta: { fontSize: 10, color: '#A89880', marginTop: 2 },
  machineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  machineLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  machineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary },
  machineLabel: { fontSize: 12, fontWeight: '600', color: Colors.text },
  machineKapasitas: { fontSize: 10, color: Colors.textMuted },
  machineStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  machineStatusText: { fontSize: 9, fontWeight: '700' },
  machineDivider: { height: 1, backgroundColor: Colors.border + '10', marginVertical: 4 },
  cardBtnContainer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  cardBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  cardBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  cardBtnArrow: { fontSize: 17, color: '#fff', fontWeight: '300' },
});


