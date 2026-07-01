import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';

const STATUS_ORDER = [
  'menunggu_konfirmasi',
  'dikonfirmasi',
  'menunggu_pembayaran',
  'diproses',
  'selesai',
];

const STATUS_DOTS: Record<string, { label: string; color: string; desc: string }> = {
  menunggu_konfirmasi: { label: 'Menunggu Konfirmasi', color: '#D97706', desc: 'Pesanan kamu sedang menunggu konfirmasi dari tim kami' },
  dikonfirmasi: { label: 'Dikonfirmasi', color: Colors.secondary, desc: 'Tim kami sudah menerima dan mengonfirmasi pesanan kamu' },
  menunggu_pembayaran: { label: 'Menunggu Pembayaran', color: Colors.error, desc: 'Tim kami sudah menimbang, silakan lakukan pembayaran' },
  diproses: { label: 'Diproses', color: '#7C3AED', desc: 'Pembayaran berhasil, cucian kamu sedang diproses' },
  selesai: { label: 'Selesai', color: '#059669', desc: 'Pesanan sudah selesai dan siap diambil' },
};

export default function TrackingScreen({ route, navigation }: any) {
  const { item } = route.params!;
  const currentIdx = STATUS_ORDER.indexOf(item.status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Tracking Pesanan</Text>
          <Text style={styles.headerSub}>{item.service}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informasi Pesanan</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Pesanan</Text>
            <Text style={styles.infoValue}>#{item.id}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Layanan</Text>
            <Text style={styles.infoValue}>{item.service}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>{item.date}</Text>
          </View>
          {item.shift ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Jam</Text>
                <Text style={styles.infoValue}>{item.shift}</Text>
              </View>
            </>
          ) : null}
          {item.weight ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Berat</Text>
                <Text style={styles.infoValue}>{item.weight} kg</Text>
              </View>
            </>
          ) : null}
          {item.address ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Alamat</Text>
                <Text style={styles.infoValue}>{item.address}</Text>
              </View>
            </>
          ) : null}
          {item.total ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total</Text>
                <Text style={styles.infoValueBold}>Rp{item.total.toLocaleString('id-ID')}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Status Pesanan</Text>
          <View style={styles.timeline}>
            {STATUS_ORDER.map((s, i) => {
              const dot = STATUS_DOTS[s];
              const isActive = i <= currentIdx;
              const isLast = i === STATUS_ORDER.length - 1;
              const isCurrent = i === currentIdx;

              return (
                <View key={s} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, styles.timelineDotOuter, isActive && { borderColor: dot.color }]}>
                      {isActive && <View style={[styles.timelineDotInner, { backgroundColor: dot.color }]} />}
                    </View>
                    {!isLast && (
                      <View style={[styles.timelineLine, { backgroundColor: i < currentIdx ? dot.color : Colors.borderLight }]} />
                    )}
                  </View>
                  <View style={[styles.timelineRight, isCurrent && styles.timelineRightActive]}>
                    <Text style={[styles.timelineLabel, { color: isActive ? dot.color : Colors.textMuted, fontWeight: isActive ? '700' : '400' }]}>
                      {dot.label}
                    </Text>
                    <Text style={[styles.timelineDesc, { color: isActive ? Colors.textSecondary : Colors.textMuted }]}>
                      {dot.desc}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {item.status === 'menunggu_pembayaran' && item.metode_pembayaran === 'qris' && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() =>
              navigation.navigate('QrisPayment', {
                bookingId: item.id,
                total: item.total,
                serviceName: item.service,
                bookingDate: item.date,
              })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.payBtnText}>Bayar Sekarang (QRIS)</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  content: {
    padding: Spacing.xl,
    paddingBottom: 40,
    gap: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  infoTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  infoLabel: { ...Typography.caption, color: Colors.textMuted },
  infoValue: { ...Typography.body, fontWeight: '500' },
  infoValueBold: { ...Typography.bodyBold, color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.borderLight },
  timelineCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  timelineTitle: {
    ...Typography.h3,
    marginBottom: Spacing.lg,
  },
  timeline: { gap: 0 },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 64,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 32,
    marginRight: Spacing.md,
  },
  timelineDotOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineDot: {},
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 32,
  },
  timelineRight: {
    flex: 1,
    paddingTop: 1,
    paddingBottom: Spacing.md,
  },
  timelineRightActive: {
    backgroundColor: Colors.secondary + '08',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginLeft: -Spacing.md,
  },
  timelineLabel: {
    ...Typography.bodyBold,
    fontSize: 14,
  },
  timelineDesc: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  payBtn: {
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  payBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
