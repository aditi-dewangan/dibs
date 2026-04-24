import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../lib/ThemeContext'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Alert, Pressable } from 'react-native'
import { useState, useEffect } from 'react'
import { Picker } from '@react-native-picker/picker'
import { Ionicons } from '@expo/vector-icons'
import { TERMS_TEXT } from '../../lib/terms'

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {children}
      </View>
    </View>
  )
}

function Row({ label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={[styles.rowText, danger && { color: '#C94040' }]}>
        {label}
      </Text>
      {!danger && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  )
}

export default function ProfileScreen() {
  const { primaryColor, secondaryColor } = useTheme()
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [issueMessage, setIssueMessage] = useState('')
  const [submittingIssue, setSubmittingIssue] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [universities, setUniversities] = useState([])
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [locationType, setLocationType] = useState('study')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [submittingLocation, setSubmittingLocation] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  useEffect(() => {
    async function loadUniversities() {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (!error && data) {
        setUniversities(data)
        if (data.length > 0) setSelectedUniversity(data[0].id)
      }
    }
    loadUniversities()
  }, [])

  async function submitIssue() {
    if (!issueMessage.trim()) {
      Alert.alert('Missing message', 'Please describe the issue.')
      return
    }

    setSubmittingIssue(true)

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('USER:', user)
    console.log('USER ERROR:', userError)

    if (!user) {
      setSubmittingIssue(false)
      Alert.alert('Not signed in', 'Please sign in again.')
      return
    }

    const { data, error } = await supabase
      .from('issue_reports')
      .insert({
        user_id: user.id,
        message: issueMessage.trim()
      })
      .select()

    console.log('INSERT DATA:', data)
    console.log('INSERT ERROR:', error)

    setSubmittingIssue(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    setIssueMessage('')
    setShowIssueModal(false)
    Alert.alert('Thanks!', 'Your issue has been submitted.')
  }
  async function submitLocation() {
    if (!selectedUniversity || !locationName.trim() || !locationAddress.trim() || !websiteUrl.trim()) {
      Alert.alert('Missing fields', 'Please fill out university, location name, address, and Website URL')
      return
    }

    setSubmittingLocation(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setSubmittingLocation(false)
      Alert.alert('Not signed in', 'Please sign in again.')
      return
    }

    const university = universities.find(u => u.id === selectedUniversity)

    const { error } = await supabase
      .from('location_submissions')
      .insert({
        contributor_id: user.id,
        university_id: selectedUniversity,
        university_name: university?.name || '',
        location_name: locationName.trim(),
        location_address: locationAddress.trim(),
        location_type: locationType,
        website_url: websiteUrl.trim() || null
      })

    setSubmittingLocation(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    setLocationName('')
    setLocationAddress('')
    setLocationType('study')
    setWebsiteUrl('')
    setShowLocationModal(false)

    Alert.alert('Submitted!', 'Your location was submitted for review.')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Account Details">
          <Row label="Name" onPress={() => {}} />
          <Row label="Email" onPress={() => {}} />
          <Row label="University" onPress={() => {}} />
          <Row label="Change password" onPress={() => {}} />
        </Section>

        <Section title="Contribute">
          <Row label="Submit a location" onPress={() => setShowLocationModal(true)} />
          <Row label="Report an issue" onPress={() => setShowIssueModal(true)} />
        </Section>

        <Section title="Legal">
          <Row label="Terms & Conditions" onPress={() => setShowTerms(true)} />
        </Section>

        <Section title="Account">
          <Row label="Sign out" onPress={handleSignOut} />
          <Row label="Delete account" onPress={() => {}} danger />
        </Section>
      </ScrollView>
      <Modal
        visible={showIssueModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIssueModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowIssueModal(false)} />

        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Report an Issue</Text>

          <TextInput
            style={styles.issueInput}
            placeholder="What went wrong?"
            placeholderTextColor="#999"
            multiline
            value={issueMessage}
            onChangeText={setIssueMessage}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowIssueModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: primaryColor }]}
              onPress={submitIssue}
              disabled={submittingIssue}
            >
              <Text style={styles.submitText}>
                {submittingIssue ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowLocationModal(false)} />

        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Submit a Location</Text>

          <Text style={styles.inputLabel}>University</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedUniversity}
              onValueChange={(val) => setSelectedUniversity(val)}
              style={{height:60}}
              itemStyle={{height:50, textAlignVertical: 'center'}}
            >
              {universities.map((u) => (
                <Picker.Item key={u.id} label={u.name} value={u.id} />
              ))}
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Location name"
            placeholderTextColor="#999"
            value={locationName}
            onChangeText={setLocationName}
          />

          <TextInput
            style={styles.input}
            placeholder="Location address"
            placeholderTextColor="#999"
            value={locationAddress}
            onChangeText={setLocationAddress}
          />

          <Text style={styles.inputLabel}>Type</Text>
          <View style={styles.typeRow}>
            {['study', 'food', 'both'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typePill,
                  locationType === type && { backgroundColor: primaryColor }
                ]}
                onPress={() => setLocationType(type)}
              >
                <Text
                  style={[
                    styles.typeText,
                    locationType === type && { color: '#fff' }
                  ]}
                >
                  {type === 'study' ? 'Study' : type === 'food' ? 'Food' : 'Both'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Website URL"
            placeholderTextColor="#999"
            autoCapitalize="none"
            value={websiteUrl}
            onChangeText={setWebsiteUrl}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: primaryColor }]}
              onPress={submitLocation}
              disabled={submittingLocation}
            >
              <Text style={styles.submitText}>
                {submittingLocation ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showTerms}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTerms(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowTerms(false)} />

        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms & Conditions</Text>
            <TouchableOpacity onPress={() => setShowTerms(false)}>
              <Ionicons name="close" size={22} color="#999" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 300 }}>
            <Text style={styles.termsText}>
              {TERMS_TEXT}
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeTermsBtn, { backgroundColor: primaryColor }]}
            onPress={() => setShowTerms(false)}
          >
            <Text style={styles.closeTermsText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff'
  },
  content: {
    padding: 20,
    paddingTop: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    overflow: 'hidden'
  },
  row: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rowText: {
    fontSize: 15,
    color: '#1a1a1a'
  },
  chevron: {
    fontSize: 18,
    color: '#ccc'
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
  color: '#1a1a1a',
  marginBottom: 12
},
issueInput: {
  minHeight: 120,
  borderWidth: 1,
  borderColor: '#e0e0e0',
  borderRadius: 12,
  padding: 12,
  fontSize: 15,
  color: '#1a1a1a',
  textAlignVertical: 'top',
  marginBottom: 16
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10
  },
  termsText: {
  fontSize: 14,
  color: '#444',
  lineHeight: 20
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center'
  },
  cancelText: {
    color: '#666',
    fontWeight: '600'
  },
  closeTermsBtn: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  closeTermsText: {
    color: '#fff',
    fontWeight: '600'
  },
  submitBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center'
  },
  submitText: {
    color: '#fff',
    fontWeight: '600'
  },
  inputLabel: {
  fontSize: 13,
  fontWeight: '600',
  color: '#666',
  marginBottom: 6
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
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 12
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  typePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    alignItems: 'center'
  },
  typeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12
  },
})