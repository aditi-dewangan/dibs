import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { supabase } from '../../lib/supabase'

export default function SignupScreen({ onNavigateLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [universities, setUniversities] = useState([])
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load universities for the dropdown on mount
  useEffect(() => {
    async function loadUniversities() {
        const { data, error } = await supabase
            .from('universities')
            .select('id, name')
            .eq('is_active', true)
            .order('name')

        // ADD THESE TWO LINES
        console.log('universities data:', JSON.stringify(data))
        console.log('universities error:', JSON.stringify(error))

        if (!error) {
            setUniversities(data)
            if (data.length > 0) setSelectedUniversity(data[0].id)
        }
    }
    loadUniversities()
  }, [])

  async function handleSignup() {
    if (!email || !password || !displayName || !selectedUniversity) {
      Alert.alert('Missing fields', 'Please fill out all fields.')
      return
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    // 1. Create the auth user
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      Alert.alert('Signup failed', error.message)
      setLoading(false)
      return
    }

    // 2. Update the profile row the trigger created with their name + university
    // The trigger already inserted the row — we just need to fill in the rest
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        display_name: displayName,
        university_id: selectedUniversity
      })
      .eq('id', data.user.id)

    if (profileError) {
      Alert.alert('Profile setup failed', profileError.message)
    }

    setLoading(false)
    // AuthGate handles redirect automatically on session creation
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join your campus community</Text>

        <TextInput
          style={styles.input}
          placeholder="Display name"
          placeholderTextColor="#999"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Your university</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedUniversity}
            onValueChange={(val) => setSelectedUniversity(val)}
          >
            {universities.map((u) => (
              <Picker.Item key={u.id} label={u.name} value={u.id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating account...' : 'Create account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNavigateLogin} style={styles.link}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 32
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 14,
    color: '#1a1a1a'
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginTop: 4
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden'
  },
  button: {
    backgroundColor: '#3B9E6B',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 4
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  link: {
    marginTop: 20,
    alignItems: 'center'
  },
  linkText: {
    color: '#3B9E6B',
    fontSize: 14
  }
})