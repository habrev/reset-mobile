import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { colors, radius, shadow, font } from '../theme'
import StressBadge from '../components/StressBadge'
import PrimaryButton from '../components/PrimaryButton'

export default function AdminScreen() {
  const { logout, isAdmin } = useAuth()
  const navigation = useNavigation()

  const [tab, setTab] = useState('sessions')
  const [users, setUsers] = useState([])
  const [sessions, setSessions] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (!isAdmin) { navigation.replace('Input'); return }
    fetchData()
  }, [tab])

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      if (tab === 'sessions') {
        const res = await api.get('/api/admin4reset/results/')
        setSessions(res.data)
      } else {
        const res = await api.get('/api/admin4reset/users/')
        setUsers(res.data)
      }
    } catch {
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch() {
    setLoading(true)
    try {
      if (tab === 'sessions') {
        const res = await api.get('/api/admin4reset/results/', { params: { search } })
        setSessions(res.data)
      } else {
        const res = await api.get('/api/admin4reset/users/', { params: { search } })
        setUsers(res.data)
      }
    } catch {
      setError('Search failed.')
    } finally {
      setLoading(false)
    }
  }

  async function toggleAdmin(user) {
    try {
      await api.patch(`/api/admin4reset/users/${user.id}/`, { is_admin: !user.is_admin })
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_admin: !u.is_admin } : u))
      )
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update user.')
    }
  }

  function handleLogout() {
    logout()
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Admin Panel</Text>
            <Text style={s.headerSub}>RESET / admin4reset</Text>
          </View>
          <View style={s.headerActions}>
            <Pressable onPress={() => navigation.navigate('Input')}>
              <Text style={s.headerLink}>App</Text>
            </Pressable>
            <Pressable onPress={handleLogout}>
              <Text style={s.headerLink}>Sign out</Text>
            </Pressable>
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          {['sessions', 'users'].map((t) => (
            <Pressable
              key={t}
              style={[s.tab, tab === t && s.tabActive]}
              onPress={() => { setTab(t); setSearch('') }}
            >
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Search */}
        <View style={s.searchBar}>
          <TextInput
            style={s.searchInput}
            placeholder={tab === 'sessions' ? 'Search by email or content…' : 'Search by email…'}
            placeholderTextColor={colors.text3}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <PrimaryButton onPress={handleSearch} size="sm">Search</PrimaryButton>
          {!!search && (
            <PrimaryButton variant="ghost" size="sm" onPress={() => { setSearch(''); fetchData() }}>
              Clear
            </PrimaryButton>
          )}
        </View>

        {!!error && <Text style={s.errorText}>{error}</Text>}

        {/* Content */}
        {loading ? (
          <View style={s.loadingCenter}>
            <ActivityIndicator size="large" color={colors.blue} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {tab === 'sessions' ? (
              <View>
                {sessions.length === 0 && <Text style={s.emptyState}>No sessions found.</Text>}
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    expanded={expandedId === session.id}
                    onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
                  />
                ))}
              </View>
            ) : (
              <View>
                {users.length === 0 && <Text style={s.emptyState}>No users found.</Text>}
                {users.map((u) => (
                  <UserRow key={u.id} user={u} onToggleAdmin={() => toggleAdmin(u)} />
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  )
}

function SessionCard({ session, expanded, onToggle }) {
  const level = session.ai_output?.stress_level_int
  return (
    <View style={sc.card}>
      <Pressable style={({ pressed }) => [sc.summary, pressed && { backgroundColor: colors.bg }]} onPress={onToggle}>
        <View style={sc.meta}>
          <Text style={sc.email} numberOfLines={1}>{session.user_email}</Text>
          <View style={sc.badges}>
            <StressBadge level={level} />
            {session.feedback && (
              <View style={[sc.feedbackTag, session.feedback.rating === 'helpful' ? sc.tagHelpful : sc.tagNot]}>
                <Text style={[sc.feedbackTagText, { color: session.feedback.rating === 'helpful' ? colors.green : colors.red }]}>
                  {session.feedback.rating === 'helpful' ? 'Helpful' : 'Not Helpful'}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={sc.right}>
          <Text style={sc.date}>{formatDate(session.created_at)}</Text>
          <Text style={sc.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {expanded && (
        <View style={sc.detail}>
          <DetailBlock label="Input" text={session.input_text} />
          <DetailBlock label="Tier" text={session.ai_output?.tier} />
          <DetailBlock label="Diagnosis" text={session.ai_output?.context_summary} />
          {session.feedback?.comment && (
            <DetailBlock label="Feedback note" text={session.feedback.comment} />
          )}
        </View>
      )}
    </View>
  )
}

function DetailBlock({ label, text }) {
  if (!text) return null
  return (
    <View style={sc.detailBlock}>
      <Text style={sc.detailLabel}>{label.toUpperCase()}</Text>
      <Text style={sc.detailText}>{text}</Text>
    </View>
  )
}

function UserRow({ user, onToggleAdmin }) {
  return (
    <View style={ur.row}>
      <View style={ur.info}>
        <Text style={ur.email}>{user.email}</Text>
        <Text style={ur.count}>
          {user.submission_count} session{user.submission_count !== 1 ? 's' : ''}
        </Text>
      </View>
      <View style={ur.actions}>
        {user.is_admin && (
          <View style={ur.adminTag}>
            <Text style={ur.adminTagText}>Admin</Text>
          </View>
        )}
        <PrimaryButton
          variant={user.is_admin ? 'danger' : 'ghost'}
          size="sm"
          onPress={onToggleAdmin}
        >
          {user.is_admin ? 'Remove admin' : 'Make admin'}
        </PrimaryButton>
      </View>
    </View>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const sc = StyleSheet.create({
  card: { borderBottomWidth: 1, borderBottomColor: colors.border },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 12,
  },
  meta: { flex: 1, gap: 6 },
  email: { fontSize: 15, fontFamily: font.medium, color: colors.text },
  badges: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  right: { alignItems: 'flex-end', gap: 4 },
  date: { fontSize: 12, color: colors.text3, fontFamily: font.regular },
  chevron: { fontSize: 10, color: colors.text3 },
  feedbackTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  tagHelpful: { backgroundColor: colors.greenBg },
  tagNot: { backgroundColor: colors.redBg },
  feedbackTagText: { fontSize: 11, fontFamily: font.bold },
  detail: {
    backgroundColor: colors.bg,
    padding: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailBlock: { gap: 3 },
  detailLabel: { fontSize: 11, fontFamily: font.bold, color: colors.text2, letterSpacing: 0.6 },
  detailText: { fontSize: 14, fontFamily: font.regular, color: colors.text, lineHeight: 20 },
})

const ur = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
    flexWrap: 'wrap',
  },
  info: { gap: 2 },
  email: { fontSize: 15, fontFamily: font.medium, color: colors.text },
  count: { fontSize: 12, color: colors.text3, fontFamily: font.regular },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adminTag: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 99,
    backgroundColor: colors.blueBg,
  },
  adminTagText: { fontSize: 12, fontFamily: font.bold, color: colors.blueD },
})

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  headerTitle: { fontSize: 22, fontFamily: font.bold, color: colors.text },
  headerSub: { fontSize: 12, fontFamily: 'monospace', color: colors.text2, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 14, paddingTop: 4 },
  headerLink: { fontSize: 14, fontFamily: font.medium, color: colors.blue },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 13,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.blue },
  tabText: { fontSize: 15, fontFamily: font.medium, color: colors.text2 },
  tabTextActive: { color: colors.blue, fontFamily: font.semiBold },
  searchBar: {
    flexDirection: 'row',
    gap: 8,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    fontFamily: font.regular,
    color: colors.text,
  },
  errorText: { fontSize: 14, color: colors.red, padding: 14, fontFamily: font.regular },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 },
  emptyState: { textAlign: 'center', color: colors.text2, padding: 48, fontSize: 15, fontFamily: font.regular },
})
