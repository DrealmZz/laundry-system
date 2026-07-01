import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

interface LoadingScreenProps {
  message?: string;
  visible?: boolean;
  overlay?: boolean;
}

const TIPS = [
  'Pisahkan baju putih dan berwarna agar tidak luntur',
  'Jangan overload mesin cuci, hasil cucian jadi kurang bersih',
  'Pakai air dingin untuk baju berwarna gelap',
  'Kancingkan resleting sebelum mencuci',
  'Balik baju bertulis/gambar sebelum dicuci',
  'Rendam noda membandel dengan detergen cair dulu',
  'Jangan gunakan pemutih untuk baju berwarna',
  'Cuci handuk terpisah dari pakaian',
  'Keringkan pakaian di tempat teduh agar warna awet',
  'Setrika saat pakaian masih sedikit lembab lebih mudah',
  'Taburkan baking soda untuk menghilangkan bau apek',
  'Gunakan cuka putih sebagai pelembut alami',
  'Jangan biarkan pakaian basah terlalu lama',
  'Baca label perawatan di baju sebelum mencuci',
  'Cucian kiloan lebih hemat untuk beban banyak',
];

const DRUM_SIZE = 112;
const DOT_COUNT = 4;
const DOT_COLORS = ['#C99763', '#E8B88A', '#23395B', '#5A7BA5'];
const TIP_DURATION = 4000;

function OrbitingDot({
  index,
  orbitAnim,
}: {
  index: number;
  orbitAnim: Animated.Value;
}) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const color = DOT_COLORS[index % DOT_COLORS.length];

  useEffect(() => {
    const delay = index * 400;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bounceAnim, index]);

  const angle = (index / DOT_COUNT) * 360;
  const startAngle = angle;
  const endAngle = angle + 180;

  const translateX = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      Math.cos((startAngle * Math.PI) / 180) * 36,
      Math.cos((endAngle * Math.PI) / 180) * 36,
    ],
  });
  const translateY = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      Math.sin((startAngle * Math.PI) / 180) * 36,
      Math.sin((endAngle * Math.PI) / 180) * 36,
    ],
  });

  const scale = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.5, 1],
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: color,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    />
  );
}

function DrumRingDots() {
  return (
    <View>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * 360;
        const dotSize = i % 2 === 0 ? 4 : 3;
        return (
          <View
            key={i}
            style={[
              styles.drumDot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                left:
                  DRUM_SIZE / 2 -
                  dotSize / 2 +
                  Math.cos((angle * Math.PI) / 180) * (DRUM_SIZE / 2 - 6),
                top:
                  DRUM_SIZE / 2 -
                  dotSize / 2 +
                  Math.sin((angle * Math.PI) / 180) * (DRUM_SIZE / 2 - 6),
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function DrumAnimation() {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spinLoop.start();
    return () => spinLoop.stop();
  }, [spinAnim]);

  useEffect(() => {
    const orbitLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbitAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(orbitAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    orbitLoop.start();
    return () => orbitLoop.stop();
  }, [orbitAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.drumContainer}>
      <Animated.View
        style={[styles.drumRing, { transform: [{ rotate: spin }] }]}
      >
        <DrumRingDots />
      </Animated.View>
      {Array.from({ length: DOT_COUNT }).map((_, i) => (
        <OrbitingDot key={i} index={i} orbitAnim={orbitAnim} />
      ))}
      <Image
        source={require('../../assets/logo_laundry.png')}
        style={styles.drumLogo}
        resizeMode="contain"
      />
    </View>
  );
}

export default function LoadingScreen({
  message = 'Memuat',
  visible = true,
  overlay = false,
}: LoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const tipFade = useRef(new Animated.Value(1)).current;
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);
      return;
    }
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, fadeAnim, scaleAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      tipFade.setValue(0);
      Animated.timing(tipFade, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, TIP_DURATION);
    return () => clearInterval(interval);
  }, [tipIndex, tipFade]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.container, overlay && styles.overlay, { opacity: fadeAnim }]}
    >
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale: scaleAnim }] },
          overlay && styles.cardShadow,
        ]}
      >
        <DrumAnimation />

        <View style={styles.tipWrap}>
          <Animated.Text
            key={`tip-${tipIndex}`}
            style={[styles.tip, { opacity: tipFade }]}
          >
            {TIPS[tipIndex]}
          </Animated.Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.text}>{message}...</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    zIndex: 999,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xxxl,
    paddingTop: Spacing.xxl + Spacing.lg,
    paddingBottom: Spacing.xxl + Spacing.md,
    alignItems: 'center',
    ...Shadows.lg,
    maxWidth: 280,
    width: '100%',
  },
  cardShadow: {
    shadowColor: '#23395B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  drumContainer: {
    width: DRUM_SIZE,
    height: DRUM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drumRing: {
    position: 'absolute',
    width: DRUM_SIZE,
    height: DRUM_SIZE,
    borderRadius: DRUM_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.primary + '35',
  },
  drumDot: {
    position: 'absolute',
    backgroundColor: Colors.primary + '60',
  },
  dot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  drumLogo: {
    width: 52,
    height: 40,
  },
  tipWrap: {
    marginTop: Spacing.xl,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  tip: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.primary + '30',
    borderRadius: 1,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
