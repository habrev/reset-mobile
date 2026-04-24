import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { colors, radius, shadow, font } from '../theme'
import Field from '../components/Field'
import PrimaryButton from '../components/PrimaryButton'
import ErrorAlert from '../components/ErrorAlert'

export default function LoginScreen() {
  const { login } = useAuth()

  const [mode, setMode] = useState('login')
  const [registerStep, setRegisterStep] = useState(0)

  const [email, setEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [registrationToken, setRegistrationToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function switchMode(m) {
    setMode(m)
    setError('')
    setRegisterStep(0)
    setOtpCode('')
    setPassword('')
    setConfirmPassword('')
    setLoginPassword('')
  }

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login/', { email, password: loginPassword })
      await login({ access: res.data.access, refresh: res.data.refresh }, res.data.user)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestOtp() {
    setError('')
    setLoading(true)
    try {
      await api.post('/api/auth/request-otp/', { email })
      setRegisterStep(1)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/verify-otp/', { email, code: otpCode })
      setRegistrationToken(res.data.registration_token)
      setRegisterStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const res = await api.post('/api/auth/register/', {
        email,
        registration_token: registrationToken,
        password,
      })
      await login({ access: res.data.access, refresh: res.data.refresh }, res.data.user)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={s.brand}>
            <Text style={s.brandTitle}>RESET</Text>
            <Text style={s.brandSub}>REALTIME RESET FOR HIGH PERFORMERS</Text>
          </View>

          {/* Card */}
          <View style={[s.card, shadow.md]}>

            {/* Tabs */}
            <View style={s.tabs}>
              {['login', 'register'].map((m) => (
                <Pressable
                  key={m}
                  style={[s.tab, mode === m && s.tabActive]}
                  onPress={() => switchMode(m)}
                >
                  <Text style={[s.tabText, mode === m && s.tabTextActive]}>
                    {m === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={s.cardBody}>
              {mode === 'login' ? (
                <View style={s.form}>
                  <View style={s.formHeader}>
                    <Text style={s.formTitle}>Welcome back</Text>
                    <Text style={s.formSub}>Sign in to continue your reset journey</Text>
                  </View>
                  {!!error && <ErrorAlert message={error} />}
                  <Field label="Email address" value={email} onChangeText={setEmail}
                    keyboardType="email-address" placeholder="you@example.com" />
                  <Field label="Password" value={loginPassword} onChangeText={setLoginPassword}
                    secureTextEntry placeholder="••••••••" />
                  <PrimaryButton onPress={handleLogin} loading={loading} disabled={!email || !loginPassword}>
                    Sign In
                  </PrimaryButton>
                </View>
              ) : (
                <View style={s.form}>
                  <StepIndicator current={registerStep} />

                  {registerStep === 0 && (
                    <>
                      <View style={s.formHeader}>
                        <Text style={s.formTitle}>Create your account</Text>
                        <Text style={s.formSub}>We'll send a verification code to confirm your email</Text>
                      </View>
                      {!!error && <ErrorAlert message={error} />}
                      <Field label="Email address" value={email} onChangeText={setEmail}
                        keyboardType="email-address" placeholder="you@example.com" />
                      <PrimaryButton onPress={handleRequestOtp} loading={loading} disabled={!email}>
                        Send Verification Code
                      </PrimaryButton>
                    </>
                  )}

                  {registerStep === 1 && (
                    <>
                      <View style={s.formHeader}>
                        <Text style={s.formTitle}>Check your email</Text>
                        <Text style={s.formSub}>
                          Enter the 6-digit code sent to{' '}
                          <Text style={s.emailHighlight}>{email}</Text>
                        </Text>
                      </View>
                      {!!error && <ErrorAlert message={error} />}
                      <View style={s.otpGroup}>
                        <Text style={s.fieldLabel}>Verification code</Text>
                        <TextInput
                          style={s.otpInput}
                          value={otpCode}
                          onChangeText={(v) => setOtpCode(v.replace(/\D/g, '').slice(0, 6))}
                          keyboardType="number-pad"
                          placeholder="000000"
                          placeholderTextColor={colors.text3}
                          maxLength={6}
                          textAlign="center"
                          autoFocus
                        />
                      </View>
                      <PrimaryButton onPress={handleVerifyOtp} loading={loading} disabled={otpCode.length !== 6}>
                        Verify Code
                      </PrimaryButton>
                      <TouchableOpacity style={s.backBtn} onPress={() => { setRegisterStep(0); setOtpCode(''); setError('') }}>
                        <Text style={s.backBtnText}>← Use a different email</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {registerStep === 2 && (
                    <>
                      <View style={s.formHeader}>
                        <Text style={s.formTitle}>Set your password</Text>
                        <Text style={s.formSub}>Minimum 8 characters</Text>
                      </View>
                      {!!error && <ErrorAlert message={error} />}
                      <Field label="Password" value={password} onChangeText={setPassword}
                        secureTextEntry placeholder="••••••••" />
                      <Field label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword}
                        secureTextEntry placeholder="••••••••" />
                      <PrimaryButton onPress={handleRegister} loading={loading} disabled={!password || !confirmPassword}>
                        Create Account
                      </PrimaryButton>
                    </>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Switch mode */}
          <View style={s.switchRow}>
            <Text style={s.switchText}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}>
              <Text style={s.switchLink}>
                {mode === 'login' ? 'Create one free' : 'Sign in'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function StepIndicator({ current }) {
  const steps = ['Email', 'Verify', 'Password']
  return (
    <View style={si.row}>
      {steps.map((label, i) => (
        <View key={i} style={si.item}>
          <View style={[si.circle, i < current && si.circleDone, i === current && si.circleActive]}>
            <Text style={[si.circleText, (i < current || i === current) && si.circleTextActive]}>
              {i < current ? '✓' : String(i + 1)}
            </Text>
          </View>
          <Text style={[si.label, i === current && si.labelActive]}>{label}</Text>
          {i < steps.length - 1 && (
            <View style={[si.line, i < current && si.lineDone]} />
          )}
        </View>
      ))}
    </View>
  )
}

const si = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  circle: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: { backgroundColor: colors.blue },
  circleActive: {
    backgroundColor: colors.blueBg,
    borderWidth: 2,
    borderColor: colors.blue,
  },
  circleText: { fontSize: 12, fontFamily: font.bold, color: colors.text3 },
  circleTextActive: { color: colors.blue },
  label: { fontSize: 12, fontFamily: font.medium, color: colors.text3 },
  labelActive: { color: colors.blue },
  line: { width: 20, height: 1.5, backgroundColor: colors.border, marginHorizontal: 2 },
  lineDone: { backgroundColor: colors.blue },
})

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F4FF' },
  scroll: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 32,
    paddingBottom: 40,
    gap: 20,
  },
  brand: { alignItems: 'center', gap: 6, marginBottom: 4 },
  brandTitle: { fontSize: 48, fontFamily: font.bold, color: colors.text, letterSpacing: -1 },
  brandSub: {
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.text3,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.blue,
    backgroundColor: '#F0F7FF',
  },
  tabText: { fontSize: 14, fontFamily: font.semiBold, color: colors.text3 },
  tabTextActive: { color: colors.blue },
  cardBody: { padding: 24 },
  form: { gap: 16 },
  formHeader: { gap: 4 },
  formTitle: { fontSize: 20, fontFamily: font.bold, color: colors.text },
  formSub: { fontSize: 14, fontFamily: font.regular, color: colors.text3, lineHeight: 20 },
  emailHighlight: { fontFamily: font.semiBold, color: colors.text2 },
  fieldLabel: { fontSize: 14, fontFamily: font.medium, color: colors.text, marginBottom: 6 },
  otpGroup: { gap: 6 },
  otpInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 14,
    fontSize: 28,
    fontFamily: font.bold,
    letterSpacing: 12,
    textAlign: 'center',
    color: colors.text,
  },
  backBtn: { alignItems: 'center', paddingVertical: 4 },
  backBtnText: { fontSize: 14, color: colors.text3 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  switchText: { fontSize: 14, color: colors.text3, fontFamily: font.regular },
  switchLink: { fontSize: 14, color: colors.blue, fontFamily: font.bold },
})
