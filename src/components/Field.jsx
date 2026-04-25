import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors, radius, font } from '../theme'

export default function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoFocus }) {
  const [visible, setVisible] = useState(false)

  return (
    <View style={s.container}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputWrapper}>
        <TextInput
          style={[s.input, secureTextEntry && s.inputWithIcon]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text3}
          secureTextEntry={secureTextEntry && !visible}
          keyboardType={keyboardType || 'default'}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity style={s.eyeBtn} onPress={() => setVisible((v) => !v)}>
            <Feather name={visible ? 'eye-off' : 'eye'} size={18} color={colors.text3} />
          </TouchableOpacity>
        )}
      </View>
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
  inputWrapper: {
    position: 'relative',
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
  inputWithIcon: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
})
