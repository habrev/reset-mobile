import React, { useEffect, useRef, useState } from 'react'
import { View, Text, Animated, Easing, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import api from '../api/client'
import { colors, radius, shadow, font } from '../theme'
import PrimaryButton from '../components/PrimaryButton'

const MESSAGES = [
  'Analyzing your state…',
  'Identifying patterns…',
  'Mapping stress indicators…',
  'Building your plan…',
  'Finalizing protocol…',
  'Connecting to server…',
  'Almost there…',
]

export default function ProcessingScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const inputText = route.params?.inputText

  const [msgIndex, setMsgIndex] = useState(0)
  const [error, setError] = useState('')
  const submitted = useRef(false)
  const spinAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Spin animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()

    if (!inputText) {
      navigation.replace('Input')
      return
    }
    if (submitted.current) return
    submitted.current = true

    // Cycle messages
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 1800)

    const timeout = setTimeout(() => {
      setError('Request is taking longer than expected. Please try again.')
      clearInterval(msgInterval)
    }, 90000)

    api.post('/api/submit/', { input_text: inputText })
      .then((res) => {
        clearInterval(msgInterval)
        clearTimeout(timeout)
        navigation.replace('Results', { id: res.data.id })
      })
      .catch((err) => {
        clearInterval(msgInterval)
        clearTimeout(timeout)
        setError(err.response?.data?.error || 'Something went wrong. Please try again.')
      })

    return () => {
      clearInterval(msgInterval)
      clearTimeout(timeout)
    }
  }, [])

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  if (error) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={[s.card, shadow.md, s.center]}>
          <View style={s.errorIcon}>
            <Text style={s.errorIconText}>!</Text>
          </View>
          <Text style={s.errorHeading}>Something went wrong.</Text>
          <Text style={s.errorBody}>{error}</Text>
          <PrimaryButton onPress={() => navigation.navigate('Input', { inputText })}>
            Try Again
          </PrimaryButton>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={[s.card, shadow.md, s.center]}>
        <Animated.View style={[s.ring, { transform: [{ rotate: spin }] }]} />
        <Text style={s.msg}>{MESSAGES[msgIndex]}</Text>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 40,
    alignItems: 'center',
    gap: 20,
  },
  center: { justifyContent: 'center', alignItems: 'center' },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: colors.border,
    borderTopColor: colors.blue,
  },
  msg: {
    fontSize: 16,
    fontFamily: font.medium,
    color: colors.text2,
    textAlign: 'center',
  },
  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.redBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconText: { fontSize: 22, fontFamily: font.bold, color: colors.red },
  errorHeading: { fontSize: 20, fontFamily: font.bold, color: colors.text },
  errorBody: { fontSize: 15, fontFamily: font.regular, color: colors.text2, textAlign: 'center' },
})
