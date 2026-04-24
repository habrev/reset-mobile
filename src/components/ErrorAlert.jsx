import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, radius, font } from '../theme'

export default function ErrorAlert({ message }) {
  return (
    <View style={s.container}>
      <Text style={s.icon}>!</Text>
      <Text style={s.message}>{message}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.redBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.sm,
  },
  icon: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.red,
    marginTop: 1,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontFamily: font.regular,
    color: colors.red,
    lineHeight: 20,
  },
})
