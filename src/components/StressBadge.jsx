import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, radius, font } from '../theme'

export function getStressClass(level) {
  if (!level) return 'low'
  if (level > 7) return 'high'
  if (level >= 4) return 'mid'
  return 'low'
}

const palette = {
  high: { bg: colors.redBg, text: colors.red },
  mid: { bg: colors.amberBg, text: colors.amber },
  low: { bg: colors.greenBg, text: colors.green },
}

export default function StressBadge({ level }) {
  const cls = getStressClass(level)
  const p = palette[cls]
  return (
    <View style={[s.badge, { backgroundColor: p.bg }]}>
      <Text style={[s.text, { color: p.text }]}>
        {level ?? '—'}/10
      </Text>
    </View>
  )
}

const s = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  text: {
    fontSize: 12,
    fontFamily: font.bold,
  },
})
