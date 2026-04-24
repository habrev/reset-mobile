import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import api from '../api/client'
import { colors, radius, shadow, font } from '../theme'
import StressSlider from '../components/StressSlider'
import ActionItem from '../components/ActionItem'
import PrimaryButton from '../components/PrimaryButton'

export default function ResultsScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const id = route.params?.id

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [checkedActions, setCheckedActions] = useState([])

  useEffect(() => {
    api.get(`/api/results/${id}/`)
      .then((res) => {
        setResult(res.data)
        setCheckedActions(res.data.checked_actions || [])
        if (res.data.feedback) {
          setFeedback(res.data.feedback.rating)
          setFeedbackSent(true)
        }
      })
      .catch(() => setError('Could not load this session.'))
      .finally(() => setLoading(false))
  }, [id])

  function toggleAction(i) {
    setCheckedActions((prev) => {
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
      api.patch(`/api/results/${id}/checked-actions/`, { checked_actions: next }).catch(() => {})
      return next
    })
  }

  async function sendFeedback(rating) {
    if (feedbackSent) return
    setFeedback(rating)
    try {
      await api.post(`/api/results/${id}/feedback/`, { rating, comment: feedbackComment })
      setFeedbackSent(true)
    } catch {
      setFeedback(null)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={[s.card, shadow.md, s.center]}>
          <Text style={s.errorBody}>{error}</Text>
          <PrimaryButton onPress={() => navigation.navigate('Input')}>Back to home</PrimaryButton>
        </View>
      </SafeAreaView>
    )
  }

  const out = result?.ai_output || {}
  const stressLevel = out.stress_level_int ?? 0
  const confidence = Math.round((out.burnout_risk_score ?? 0) * 100)
  const stressClass = stressLevel > 7 ? 'high' : stressLevel >= 4 ? 'mid' : 'low'
  const stateColors = {
    high: { bg: colors.redBg, text: colors.red },
    mid: { bg: colors.amberBg, text: colors.amber },
    low: { bg: colors.greenBg, text: colors.green },
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.card, shadow.md]}>

          {/* Header */}
          <View style={s.header}>
            <Pressable onPress={() => navigation.navigate('Input')}>
              <Text style={s.backBtn}>← Back</Text>
            </Pressable>
            <Text style={s.headerTitle}>Recovery Plan</Text>
            <Text style={s.headerDate}>{formatDate(result?.created_at)}</Text>
          </View>

          <Divider />

          {/* DIAGNOSTIC SLIDER */}
          <Section label="Diagnostic">
            <StressSlider level={stressLevel} />
          </Section>

          <Divider />

          {/* STATUS */}
          <Section label="Status">
            <View style={s.statusRow}>
              <View style={s.statBlock}>
                <Text style={[s.statScore, { color: stateColors[stressClass].text }]}>
                  {confidence}%
                </Text>
                <Text style={s.statLabel}>confidence</Text>
              </View>
              <View style={s.statDivider} />
              <View style={[s.emotionTag, { backgroundColor: colors.blueBg }]}>
                <Text style={[s.emotionText, { color: colors.blueD }]}>
                  {out.primary_emotion?.toUpperCase() ?? '—'}
                </Text>
              </View>
            </View>
          </Section>

          <Divider />

          {/* DIAGNOSIS */}
          <Section label="Diagnosis">
            <Text style={s.bodyText}>{out.context_summary}</Text>
          </Section>

          <Divider />

          {/* CRITICAL STATE */}
          <Section label="Critical State">
            <View style={[s.stateBadge, { backgroundColor: stateColors[stressClass].bg }]}>
              <Text style={[s.stateBadgeText, { color: stateColors[stressClass].text }]}>
                {out.label}
              </Text>
            </View>
            <Text style={[s.bodyText, s.toneText]}>{out.tone}</Text>
          </Section>

          <Divider />

          {/* RECOVERY WINDOW */}
          <Section label="Recovery Window">
            <Text style={s.recoveryValue}>{out.recovery_window}</Text>
          </Section>

          <Divider />

          {/* PROTOCOL */}
          <Section label="Protocol" sublabel="Complete these actions to begin your reset:">
            <View style={s.actionList}>
              {(out.actions || []).map((action, i) => (
                <ActionItem
                  key={i}
                  text={action}
                  done={checkedActions.includes(i)}
                  onToggle={() => toggleAction(i)}
                />
              ))}
            </View>
          </Section>

          <Divider />

          {/* NEXT CHECK-IN */}
          <Section label="Next Check-in">
            <Text style={s.bodyText}>{out.next_checkin}</Text>
          </Section>

          <Divider />

          {/* FOOTER + FEEDBACK */}
          <View style={s.footer}>
            <PrimaryButton variant="outline" onPress={() => navigation.navigate('Input')}>
              Check again after reset
            </PrimaryButton>

            <View style={s.feedbackBlock}>
              <Text style={s.feedbackLabel}>Was this plan helpful?</Text>
              {feedbackSent ? (
                <Text style={s.feedbackSent}>
                  Thanks for your feedback{feedback === 'helpful' ? ' 🙏' : ' 🤔'}
                </Text>
              ) : (
                <View style={s.feedbackBtns}>
                  <Pressable
                    style={[s.feedbackBtn, feedback === 'helpful' && s.feedbackBtnHelpful]}
                    onPress={() => sendFeedback('helpful')}
                  >
                    <Text style={[s.feedbackBtnText, feedback === 'helpful' && { color: colors.green }]}>
                      Helpful
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[s.feedbackBtn, feedback === 'not_helpful' && s.feedbackBtnNot]}
                    onPress={() => sendFeedback('not_helpful')}
                  >
                    <Text style={[s.feedbackBtnText, feedback === 'not_helpful' && { color: colors.red }]}>
                      Not Helpful
                    </Text>
                  </Pressable>
                </View>
              )}

              {!feedbackSent && feedback && (
                <View style={s.feedbackComment}>
                  <TextInput
                    style={s.commentInput}
                    multiline
                    numberOfLines={2}
                    placeholder="Optional: anything to add?"
                    placeholderTextColor={colors.text3}
                    value={feedbackComment}
                    onChangeText={setFeedbackComment}
                    textAlignVertical="top"
                  />
                  <PrimaryButton variant="ghost" onPress={() => sendFeedback(feedback)}>
                    Submit
                  </PrimaryButton>
                </View>
              )}
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function Section({ label, sublabel, children }) {
  return (
    <View style={sec.container}>
      <Text style={sec.label}>{label.toUpperCase()}</Text>
      {sublabel && <Text style={sec.sublabel}>{sublabel}</Text>}
      {children}
    </View>
  )
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border }} />
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const sec = StyleSheet.create({
  container: { padding: 20, gap: 10 },
  label: {
    fontSize: 11,
    fontFamily: font.bold,
    color: colors.text2,
    letterSpacing: 0.8,
  },
  sublabel: { fontSize: 14, fontFamily: font.regular, color: colors.text2, marginTop: -4 },
})

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingTop: 24, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  backBtn: { fontSize: 14, fontFamily: font.medium, color: colors.blue },
  headerTitle: { fontSize: 18, fontFamily: font.bold, color: colors.text },
  headerDate: { fontSize: 12, fontFamily: font.regular, color: colors.text3, flex: 1, textAlign: 'right' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  statBlock: { alignItems: 'flex-start', gap: 2 },
  statScore: { fontSize: 34, fontFamily: font.bold, lineHeight: 40 },
  statLabel: { fontSize: 12, color: colors.text3, fontFamily: font.regular },
  statDivider: { width: 1, height: 36, backgroundColor: colors.border },
  emotionTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  emotionText: { fontSize: 12, fontFamily: font.bold, letterSpacing: 0.5 },
  bodyText: { fontSize: 15, fontFamily: font.regular, color: colors.text, lineHeight: 24 },
  toneText: { fontStyle: 'italic', color: colors.text2 },
  stateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  stateBadgeText: { fontSize: 14, fontFamily: font.bold },
  recoveryValue: { fontSize: 26, fontFamily: font.bold, color: colors.teal },
  actionList: { gap: 10 },
  footer: { padding: 20, gap: 20 },
  feedbackBlock: { gap: 12 },
  feedbackLabel: { fontSize: 14, fontFamily: font.semiBold, color: colors.text2 },
  feedbackBtns: { flexDirection: 'row', gap: 10 },
  feedbackBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  feedbackBtnHelpful: { borderColor: colors.green, backgroundColor: colors.greenBg },
  feedbackBtnNot: { borderColor: colors.red, backgroundColor: colors.redBg },
  feedbackBtnText: { fontSize: 14, fontFamily: font.semiBold, color: colors.text },
  feedbackSent: { fontSize: 15, color: colors.text2, fontFamily: font.regular },
  feedbackComment: { gap: 8 },
  commentInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 14,
    fontFamily: font.regular,
    color: colors.text,
    minHeight: 70,
  },
  errorBody: { fontSize: 15, fontFamily: font.regular, color: colors.text2, textAlign: 'center' },
})
