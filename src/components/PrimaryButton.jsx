import React from 'react'
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { colors, radius, font } from '../theme'

export default function PrimaryButton({ children, onPress, loading, disabled, variant = 'primary', size = 'md' }) {
  const isDisabled = disabled || loading

  const containerStyle = [
    s.base,
    size === 'lg' && s.large,
    size === 'sm' && s.small,
    variant === 'primary' && s.primary,
    variant === 'outline' && s.outline,
    variant === 'ghost' && s.ghost,
    variant === 'danger' && s.danger,
    isDisabled && s.disabled,
  ]

  const textStyle = [
    s.text,
    size === 'sm' && s.textSm,
    variant === 'outline' && s.textOutline,
    variant === 'ghost' && s.textGhost,
    variant === 'danger' && s.textDanger,
  ]

  return (
    <Pressable
      style={({ pressed }) => [...containerStyle, pressed && !isDisabled && s.pressed]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.blue} size="small" />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </Pressable>
  )
}

const s = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: radius.sm,
    minHeight: 48,
  },
  large: { paddingVertical: 15, minHeight: 52 },
  small: { paddingVertical: 7, paddingHorizontal: 12, minHeight: 34 },
  primary: { backgroundColor: colors.blue },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.blue },
  ghost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
  danger: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.red },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
  text: {
    fontSize: 15,
    fontFamily: font.bold,
    color: '#fff',
  },
  textSm: { fontSize: 13 },
  textOutline: { color: colors.blue },
  textGhost: { color: colors.text2 },
  textDanger: { color: colors.red },
})
