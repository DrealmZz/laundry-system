import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/theme';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING_COUNT = Math.floor(VISIBLE_ITEMS / 2);

const OPEN_HOUR = 7;
const CLOSE_HOUR = 21;
const MINUTES = [0, 15, 30, 45];

const hours = Array.from({ length: CLOSE_HOUR - OPEN_HOUR + 1 }, (_, i) => OPEN_HOUR + i);

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function WheelColumn({
  data,
  selected,
  onSelect,
}: {
  data: number[];
  selected: number;
  onSelect: (val: number) => void;
}) {
  const [selectedIdx, setSelectedIdx] = useState(() => {
    const idx = data.indexOf(selected);
    return idx >= 0 ? idx : 0;
  });
  const flatListRef = useRef<FlatList<number | null>>(null);
  const paddedData = useRef<(number | null)[]>([
    ...Array(PADDING_COUNT).fill(null),
    ...data,
    ...Array(PADDING_COUNT).fill(null),
  ]).current;

  useEffect(() => {
    const idx = data.indexOf(selected);
    if (idx >= 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: idx * ITEM_HEIGHT, animated: false });
        setSelectedIdx(idx);
      }, 50);
    }
  }, []);

  const handleMomentumEnd = useCallback((e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    setSelectedIdx(clamped);
    onSelect(data[clamped]);
  }, [data, onSelect]);

  const handleScroll = useCallback((e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    if (clamped !== selectedIdx) {
      setSelectedIdx(clamped);
    }
  }, [data.length, selectedIdx]);

  const renderItem = useCallback(({ item, index }: { item: number | null; index: number }) => {
    if (item === null) {
      return <View style={{ height: ITEM_HEIGHT }} />;
    }
    const realIndex = index - PADDING_COUNT;
    const distance = Math.abs(realIndex - selectedIdx);
    const isActive = distance === 0;
    const scale = isActive ? 1.15 : distance === 1 ? 0.92 : 0.78;
    const opacity = isActive ? 1 : distance === 1 ? 0.55 : 0.25;

    return (
      <View
        style={[
          styles.wheelItem,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <Text
          style={[
            styles.wheelItemText,
            isActive && styles.wheelItemTextActive,
          ]}
        >
          {pad(item)}
        </Text>
      </View>
    );
  }, [selectedIdx]);

  return (
    <View style={styles.wheelColumn}>
      <View style={[styles.wheelHighlight, { top: PADDING_COUNT * ITEM_HEIGHT }]}>
        <View style={styles.wheelHighlightBorder} />
        <View style={[styles.wheelHighlightBorder, { top: ITEM_HEIGHT }]} />
      </View>
      <FlatList
        ref={flatListRef}
        data={paddedData}
        renderItem={renderItem}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        bounces={false}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
      />
    </View>
  );
}

interface WheelPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (hour: number, minute: number) => void;
  initialHour?: number;
  initialMinute?: number;
}

export default function WheelPicker({
  visible,
  onClose,
  onSelect,
  initialHour,
  initialMinute,
}: WheelPickerProps) {
  const [hour, setHour] = useState(initialHour ?? OPEN_HOUR);
  const [minute, setMinute] = useState(initialMinute ?? 0);

  useEffect(() => {
    if (visible) {
      setHour(initialHour ?? OPEN_HOUR);
      setMinute(initialMinute ?? 0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Pilih Jam Pemakaian</Text>

          <View style={styles.wheelRow}>
            <View style={styles.columnWrap}>
              <Text style={styles.columnLabel}>Jam</Text>
              <WheelColumn data={hours} selected={hour} onSelect={setHour} />
            </View>
            <Text style={styles.separator}>:</Text>
            <View style={styles.columnWrap}>
              <Text style={styles.columnLabel}>Menit</Text>
              <WheelColumn data={MINUTES} selected={minute} onSelect={setMinute} />
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerBadge}>
              <Text style={styles.footerText}>Jam kerja 07:00 – 21:00</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => onSelect(hour, minute)}
              activeOpacity={0.85}
            >
              <Text style={styles.selectBtnText}>Pilih {pad(hour)}:{pad(minute)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  modal: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 28,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    ...Shadows.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  wheelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  columnWrap: {
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  wheelColumn: {
    height: PICKER_HEIGHT,
    width: 80,
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: Colors.border + '25',
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Plus Jakarta Sans' : undefined,
  },
  wheelItemTextActive: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.secondary,
  },
  wheelHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    zIndex: -1,
  },
  wheelHighlightBorder: {
    position: 'absolute',
    left: 6,
    right: 6,
    height: 1.5,
    backgroundColor: Colors.secondary + '30',
  },
  separator: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.secondary,
    marginHorizontal: 2,
    marginTop: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  footerBadge: {
    backgroundColor: Colors.secondary + '0A',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.secondary + '15',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: Colors.border + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  selectBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  selectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
