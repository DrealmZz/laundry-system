import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const initials = (user?.nama_lengkap || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const profileMenu = [
    { icon: '📋', label: 'Riwayat Pesanan', target: 'Riwayat' },
    { icon: '📍', label: 'Alamat Saya', target: 'Address' },
    { icon: '🔔', label: 'Notifikasi', target: '' },
    { icon: '❓', label: 'Pusat Bantuan', target: '' },
    { icon: '📝', label: 'Syarat & Ketentuan', target: '' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil Saya</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.nama_lengkap || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || '-'}</Text>
          <View style={styles.userRoleBadge}>
            <Text style={styles.userRoleText}>{user?.role || 'customer'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Total Cuci</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {profileMenu.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i < profileMenu.length - 1 && styles.menuItemBorder]}
              activeOpacity={0.7}
              onPress={() => item.target && (navigation as any).navigate(item.target)}
            >
              <View style={styles.menuIconBox}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <Text style={styles.logoutBtnText}>Keluar</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: { paddingBottom: Spacing.xxl },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  userEmail: { fontSize: 12, color: Colors.textMuted, marginBottom: Spacing.sm },
  userRoleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  userRoleText: { fontSize: 10, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    height: 30,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuIcon: { fontSize: 16 },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.text },
  menuArrow: { fontSize: 18, color: Colors.textMuted, fontWeight: '300' },
  logoutBtn: {
    marginHorizontal: Spacing.xl,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error + '30',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
  },
  logoutBtnText: { fontSize: 13, fontWeight: '600', color: Colors.error },
});
