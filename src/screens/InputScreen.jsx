import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { colors, radius, shadow, font } from '../theme'
import PrimaryButton from '../components/PrimaryButton'
import StressBadge from '../components/StressBadge'

export default function InputScreen() {
  const { logout, isAdmin } = useAuth()
  const navigation = useNavigation()

  const [inputText, setInputText] = useState('')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      loadHistory(false)
    }, [])
  )

  async function loadHistory(isPullRefresh = false) {
    if (isPullRefresh) setRefreshing(true)
    else setHistoryLoading(true)
    setHistoryError('')

    try {
      const res = await api.get('/api/results/')
      console.log('[History] status:', res.status)
      console.log('[History] data type:', Array.isArray(res.data) ? 'array' : typeof res.data)
      console.log('[History] data:', JSON.stringify(res.data).slice(0, 300))

      // Handle plain array OR DRF paginated { count, results: [] }
      const raw = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
          ? res.data.results
          : []

      console.log('[History] parsed count:', raw.length)
      setHistory(raw.slice(0, 5))
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Unknown error'
      console.log('[History] error:', status, msg)
      setHistoryError(`${status ?? 'Network error'}: ${msg}`)
    } finally {
      setHistoryLoading(false)
      setRefreshing(false)
    }
  }

  function handleSubmit() {
    if (!inputText.trim()) return
    navigation.navigate('Processing', { inputText: inputText.trim() })
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadHistory(true)}
              tintColor={colors.blue}
              colors={[colors.blue]}
            />
          }
        >
          <View style={[s.card, shadow.md]}>

            {/* Header */}
            <View style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={s.brandTitle}>Burnout Recovery</Text>
                <Text style={s.brandSub}>Realtime reset for high performers</Text>
              </View>
              <View style={s.headerActions}>
                {isAdmin && (
                  <Pressable onPress={() => navigation.navigate('Admin')}>
                    <Text style={s.headerLink}>Admin</Text>
                  </Pressable>
                )}
                <Pressable onPress={logout}>
                  <Text style={s.headerLink}>Sign out</Text>
                </Pressable>
              </View>
            </View>

            {/* Form */}
            <View style={s.form}>
              <Text style={s.promptLabel}>What's going on right now?</Text>
              <TextInput
                style={s.textarea}
                multiline
                numberOfLines={5}
                placeholder={"Describe what's happening — your workload, your state of mind, how your body feels, what's weighing on you..."}
                placeholderTextColor={colors.text3}
                value={inputText}
                onChangeText={setInputText}
                textAlignVertical="top"
              />
              <PrimaryButton
                onPress={handleSubmit}
                disabled={!inputText.trim()}
                size="lg"
              >
                Get My RESET Plan
              </PrimaryButton>
            </View>

            {/* Recent Sessions */}
            <View style={s.historySection}>
              <View style={s.historyHeader}>
                <Text style={s.sectionTitle}>RECENT SESSIONS</Text>
                {!historyLoading && (
                  <Pressable onPress={() => loadHistory(false)}>
                    <Text style={s.refreshLink}>Refresh</Text>
                  </Pressable>
                )}
              </View>

              {historyLoading ? (
                <ActivityIndicator size="small" color={colors.blue} style={s.loader} />
              ) : historyError ? (
                <View style={s.emptyBox}>
                  <Text style={s.errorText}>{historyError}</Text>
                  <Pressable onPress={() => loadHistory(false)}>
                    <Text style={s.retryText}>Tap to retry</Text>
                  </Pressable>
                </View>
              ) : history.length === 0 ? (
                <View style={s.emptyBox}>
                  <Text style={s.emptyText}>No sessions yet.</Text>
                  <Text style={s.emptyHint}>
                    Complete your first RESET plan and it will appear here.
                  </Text>
                </View>
              ) : (
                <View style={s.historyList}>
                  {history.map((item) => (
                    <Pressable
                      key={item.id}
                      style={({ pressed }) => [s.historyItem, pressed && s.pressed]}
                      onPress={() => navigation.navigate('Results', { id: item.id })}
                    >
                      <View style={s.historyLeft}>
                        <StressBadge level={item.ai_output?.stress_level_int} />
                        <Text style={s.historyPreview} numberOfLines={1}>
                          {item.input_text}
                        </Text>
                      </View>
                      <Text style={s.historyDate}>{formatDate(item.created_at)}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: 16, paddingTop: 24, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 24,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandTitle: { fontSize: 22, fontFamily: font.bold, color: colors.text, letterSpacing: -0.3 },
  brandSub: { fontSize: 13, fontFamily: font.regular, color: colors.text2, marginTop: 3 },
  headerActions: { flexDirection: 'row', gap: 12, paddingTop: 3 },
  headerLink: { fontSize: 14, fontFamily: font.medium, color: colors.blue },
  form: { gap: 12 },
  promptLabel: { fontSize: 17, fontFamily: font.semiBold, color: colors.text },
  textarea: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 14,
    fontSize: 15,
    fontFamily: font.regular,
    color: colors.text,
    minHeight: 120,
    lineHeight: 22,
  },
  historySection: { gap: 10 },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: font.semiBold,
    color: colors.text2,
    letterSpacing: 0.8,
  },
  refreshLink: { fontSize: 13, fontFamily: font.medium, color: colors.blue },
  loader: { paddingVertical: 16 },
  emptyBox: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 6,
  },
  emptyText: { fontSize: 14, fontFamily: font.medium, color: colors.text3 },
  emptyHint: {
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text3,
    textAlign: 'center',
  },
  errorText: { fontSize: 13, fontFamily: font.regular, color: colors.red, textAlign: 'center' },
  retryText: { fontSize: 13, fontFamily: font.semiBold, color: colors.blue },
  historyList: { gap: 6 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  pressed: { backgroundColor: colors.bg },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  historyPreview: { fontSize: 14, color: colors.text2, fontFamily: font.regular, flex: 1 },
  historyDate: { fontSize: 12, color: colors.text3, fontFamily: font.regular, flexShrink: 0 },
})
