import React, { useEffect, useRef, useState } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { colors, font } from '../theme'

const THUMB = 22

export default function StressSlider({ level = 0 }) {
  const progress = useRef(new Animated.Value(0)).current
  const [trackW, setTrackW] = useState(0)

  const stressColor = level > 7 ? colors.red : level >= 4 ? colors.amber : colors.green
  const stressBg = level > 7 ? colors.redBg : level >= 4 ? colors.amberBg : colors.greenBg
  const stressLabel = level > 7 ? 'High Stress' : level >= 4 ? 'Moderate Stress' : 'Low Stress'

  useEffect(() => {
    if (trackW === 0) return
    Animated.spring(progress, {
      toValue: level / 10,
      useNativeDriver: false,
      damping: 14,
      stiffness: 90,
    }).start()
  }, [level, trackW])

  const fillW = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackW],
    extrapolate: 'clamp',
  })

  const thumbX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-THUMB / 2, trackW - THUMB / 2],
    extrapolate: 'clamp',
  })

  return (
    <View style={s.wrapper}>
      {/* Score display */}
      <View style={s.scoreRow}>
        <View style={s.scoreLeft}>
          <Text style={[s.scoreNum, { color: stressColor }]}>{level}</Text>
          <Text style={s.scoreDenom}> / 10</Text>
        </View>
        <View style={[s.stressLabel, { backgroundColor: stressBg }]}>
          <Text style={[s.stressLabelText, { color: stressColor }]}>{stressLabel}</Text>
        </View>
      </View>

      {/* Track */}
      <View
        style={s.trackOuter}
        onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
      >
        <View style={s.track}>
          <Animated.View
            style={[s.fill, { width: fillW, backgroundColor: stressColor }]}
          />
        </View>
        {trackW > 0 && (
          <Animated.View
            style={[
              s.thumb,
              {
                left: thumbX,
                backgroundColor: stressColor,
                borderColor: stressBg,
              },
            ]}
          />
        )}
      </View>

      {/* Scale labels */}
      <View style={s.scaleRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <Text
            key={n}
            style={[
              s.scaleTick,
              n <= level && { color: stressColor, fontFamily: font.semiBold },
            ]}
          >
            {n}
          </Text>
        ))}
      </View>

      {/* Zone labels */}
      <View style={s.zoneRow}>
        <Text style={[s.zoneText, { color: colors.green }]}>Low</Text>
        <Text style={[s.zoneText, { color: colors.amber }]}>Moderate</Text>
        <Text style={[s.zoneText, { color: colors.red }]}>High</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrapper: { gap: 10 },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNum: {
    fontSize: 42,
    fontFamily: font.bold,
    lineHeight: 48,
  },
  scoreDenom: {
    fontSize: 18,
    fontFamily: font.medium,
    color: colors.text3,
  },
  stressLabel: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
  },
  stressLabelText: {
    fontSize: 13,
    fontFamily: font.bold,
  },
  trackOuter: {
    height: THUMB,
    justifyContent: 'center',
    marginVertical: 4,
  },
  track: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
    top: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  scaleTick: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.text3,
  },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  zoneText: {
    fontSize: 11,
    fontFamily: font.semiBold,
  },
})
