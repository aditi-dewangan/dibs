import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, Modal, Pressable
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../lib/ThemeContext'
import { TERMS_TEXT } from '../../lib/terms'

export default function SignupScreen({ onNavigateLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [universities, setUniversities] = useState([])
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const { primaryColor } = useTheme()

  useEffect(() => {
    async function loadUniversities() {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

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

    if (!acceptedTerms) {
      Alert.alert('Terms required', 'Please accept the Terms & Conditions to sign up.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
          university_id: selectedUniversity,
          accepted_terms: true,
          accepted_terms_at: new Date().toISOString()
        }
      }
    })

    if (error) {
      Alert.alert('Signup failed', error.message)
      setLoading(false)
      return
    }

    setLoading(false)
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
            style={{height:60}}
            itemStyle={{height:50, textAlignVertical: 'center'}}
          >s
            {universities.map((u) => (
              <Picker.Item key={u.id} label={u.name} value={u.id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAcceptedTerms(!acceptedTerms)}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
            {acceptedTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={{ color: '#3B9E6B' }} onPress={() => setShowTerms(true)}>
              Terms & Conditions
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            (loading || !acceptedTerms) && styles.buttonDisabled
          ]}
          onPress={handleSignup}
          disabled={loading || !acceptedTerms}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating account...' : 'Create account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNavigateLogin} style={styles.link}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
        <Modal
          visible={showTerms}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTerms(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setShowTerms(false)} />

          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Terms & Conditions</Text>

            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.termsBody}>
                {TERMS_TEXT}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeTermsBtn}
              onPress={() => setShowTerms(false)}
            >
              <Text style={styles.closeTermsText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
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
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingTop: 10
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxActive: {
    backgroundColor: '#3B9E6B',
    borderColor: '#3B9E6B'
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#555'
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
  },
  modalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.3)'
  },
  modalSheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  termsBody: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20
  },
  closeTermsBtn: {
    marginTop: 16,
    backgroundColor: '#3B9E6B',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  closeTermsText: {
    color: '#fff',
    fontWeight: '600'
  }
})