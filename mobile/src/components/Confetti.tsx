import { useEffect, useMemo, useRef } from 'react'
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native'

const COLORS = ['#22c55e', '#fbbf24', '#f472b6', '#60a5fa', '#ffffff', '#a78bfa']

// Pieces of paper that fall once across the screen.
export function Confetti({ count = 70 }: { count?: number }) {
  const { width, height } = useWindowDimensions()
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        drift: (Math.random() - 0.5) * 120,
        size: 6 + Math.random() * 8,
        delay: Math.random() * 700,
        duration: 2200 + Math.random() * 1800,
        spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720),
        color: COLORS[i % COLORS.length],
      })),
    [count, width],
  )
  const progress = useRef(pieces.map(() => new Animated.Value(0))).current

  useEffect(() => {
    Animated.parallel(
      pieces.map((p, i) =>
        Animated.timing(progress[i], {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ),
    ).start()
  }, [pieces, progress])

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: -20,
            width: p.size,
            height: p.size * 0.5,
            borderRadius: 1,
            backgroundColor: p.color,
            transform: [
              { translateY: progress[i].interpolate({ inputRange: [0, 1], outputRange: [0, height + 40] }) },
              { translateX: progress[i].interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
              { rotate: progress[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  )
}
