import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { colors, radius, font } from '../theme'

export default function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoFocus }) {
  return (
    <View style={s.container}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text3}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: 14,
    fontFamily: font.medium,
    color: colors.text,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    fontSize: 15,
    fontFamily: font.regular,
    color: colors.text,
    backgroundColor: colors.surface,
  },
})
