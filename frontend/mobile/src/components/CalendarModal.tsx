import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

type Props = {
  visible: boolean;
  selected: string;
  onSelect: (iso: string) => void;
  onClose: () => void;
  minDate?: Date;
  maxDate?: Date;
};

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export default function CalendarModal({ visible, selected, onSelect, onClose, minDate, maxDate }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialDate = selected ? new Date(selected + 'T00:00:00') : today;
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const todayDate = today;

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isDisabled = (d: Date) => {
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  const handleSelect = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    if (isDisabled(d)) return;
    onSelect(toISO(d));
    onClose();
  };

  const rows: React.ReactNode[] = [];
  let cells: React.ReactNode[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<View key={`empty-${i}`} style={styles.cell} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const iso = toISO(d);
    const isSel = iso === selected;
    const isTd = sameDay(d, todayDate);
    const disabled = isDisabled(d);

    cells.push(
      <TouchableOpacity
        key={day}
        style={[
          styles.cell,
          isSel && styles.cellSelected,
          !isSel && isTd && styles.cellToday,
          disabled && styles.cellDisabled,
        ]}
        onPress={() => handleSelect(day)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.cellText,
            isSel && styles.cellTextSelected,
            !isSel && isTd && styles.cellTextToday,
            disabled && styles.cellTextDisabled,
          ]}
        >
          {day}
        </Text>
      </TouchableOpacity>,
    );

    if (cells.length === 7) {
      rows.push(<View key={`row-${day}`} style={styles.row}>{cells}</View>);
      cells = [];
    }
  }

  if (cells.length > 0) {
    while (cells.length < 7) {
      cells.push(<View key={`empty-end-${cells.length}`} style={styles.cell} />);
    }
    rows.push(<View key="row-last" style={styles.row}>{cells}</View>);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.container} activeOpacity={1} onPress={() => {}}>
          <View style={styles.header}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn} activeOpacity={0.6}>
              <Text style={styles.navText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn} activeOpacity={0.6}>
              <Text style={styles.navText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dayNamesRow}>
            {DAY_NAMES.map((name) => (
              <View key={name} style={styles.cell}>
                <Text style={styles.dayNameText}>{name}</Text>
              </View>
            ))}
          </View>

          {rows}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary + '0C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: { fontSize: 20, color: Colors.secondary, fontWeight: '700' },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  dayNameText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary + '50',
    borderRadius: 12,
    backgroundColor: Colors.primary + '0C',
  },
  cellDisabled: { opacity: 0.3 },
  cellText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  cellTextSelected: { color: '#fff', fontWeight: '700' },
  cellTextToday: { color: Colors.primary, fontWeight: '700' },
  cellTextDisabled: { color: Colors.textMuted },
});
