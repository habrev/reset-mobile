import React from 'react'
import { Pressable, View, Text, StyleSheet } from 'react-native'
import { colors, radius, font } from '../theme'

export default function ActionItem({ text, done, onToggle }) {
  return (
    <Pressable
      style={({ pressed }) => [s.item, done && s.itemDone, pressed && s.pressed]}
      onPress={onToggle}
    >
      <View style={[s.check, done && s.checkDone]}>
        {done && <Text style={s.checkMark}>✓</Text>}
      </View>
      <Text style={[s.text, done && s.textDone]}>{text}</Text>
    </Pressable>
  )
}

const s = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  itemDone: {
    backgroundColor: colors.greenBg,
    borderColor: colors.green,
  },
  pressed: { opacity: 0.85 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: colors.surface,
  },
  checkDone: {
    borderColor: colors.green,
    backgroundColor: colors.greenBg,
  },
  checkMark: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.green,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontFamily: font.regular,
    color: colors.text,
    lineHeight: 22,
  },
  textDone: {
    color: colors.text2,
    textDecorationLine: 'line-through',
  },
})
