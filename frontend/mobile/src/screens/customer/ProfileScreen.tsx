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
import Icon from '../../components/Icon';

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
    { icon: 'pencil', label: 'Edit Profil', target: 'EditProfile' },
    { icon: 'card-list', label: 'Riwayat Pesanan', target: 'Riwayat' },
    { icon: 'geo-alt', label: 'Alamat Saya', target: 'Address' },
    { icon: 'bell', label: 'Notifikasi', target: 'Notification' },
    { icon: 'info-circle', label: 'Pusat Bantuan', target: 'Help' },
    { icon: 'file-text', label: 'Syarat & Ketentuan', target: 'Terms' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil Saya</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
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
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Pesanan</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Poin</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Voucher</Text>
          </View>
        </View>

        <View style={styles.menuGroup}>
          {profileMenu.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                if (item.target) {
                  (navigation as any).navigate(item.target);
                }
              }}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Icon name={item.icon} size={18} color={Colors.secondary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Icon name="chevron-right" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <Icon name="door-open" size={18} color={Colors.error} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
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
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
  content: { paddingBottom: Spacing.xxl },
  profileCard: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    ...Shadows.md,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  userEmail: { fontSize: 12, color: Colors.textMuted, marginBottom: Spacing.sm },
  userRoleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
  },
  userRoleText: { fontSize: 10, fontWeight: '700', color: Colors.primary, textTransform: 'capitalize' },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  menuGroup: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: { fontSize: 13, fontWeight: '600', color: Colors.text },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xxl,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: Colors.error },
});
