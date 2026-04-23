import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { supabase } from '../../lib/supabase'
import LoginScreen from './LoginScreen'
import SignupScreen from './SignupScreen'
import MainTabs from '../tabs/MainTabs'

export default function AuthGate() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSignup, setShowSignup] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B9E6B" />
      </View>
    )
  }

  if (session) return <MainTabs />

  return showSignup
    ? <SignupScreen onNavigateLogin={() => setShowSignup(false)} />
    : <LoginScreen onNavigateSignup={() => setShowSignup(true)} />
}