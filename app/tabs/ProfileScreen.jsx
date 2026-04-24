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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profile, setProfile] = useState(null)
  const [profileEmail, setProfileEmail] = useState('')
  const [profileName, setProfileName] = useState('')
  const [showUniversityModal, setShowUniversityModal] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const isReady = confirmPassword.length >= 6

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }
  async function updateUniversity() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !selectedUniversity) return

    const { error } = await supabase
      .from('user_profiles')
      .update({ university_id: selectedUniversity })
      .eq('id', user.id)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    setShowUniversityModal(false)

    // reload profile so UI updates
    loadProfile()
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
  
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setProfileEmail(user.email)
      setProfileName(user.user_metadata?.full_name || '')

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('university_id')
        .eq('id', user.id)
        .single()

      setSelectedUniversity(profileData?.university_id)

      let universityName = ''

      if (profileData?.university_id) {
        const { data: university, error: universityError } = await supabase
          .from('universities')
          .select('name')
          .eq('id', profileData.university_id)
          .single()


        universityName = university?.name || ''
      }

      setProfile({
        ...profileData,
        university_name: universityName
      })
    }

    loadProfile()
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
  async function deleteAccount() {
    setDeletingAccount(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setDeletingAccount(false)
      Alert.alert('Error', 'You are not signed in.')
      return
    }

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', user.id)

    if (error) {
      setDeletingAccount(false)
      Alert.alert('Error', error.message)
      return
    }

    await supabase.auth.signOut()
    setDeletingAccount(false)
  }
  async function updatePassword() {
    // Rule check
    if (
      newPassword.length < 6 ||
      !/[a-zA-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      Alert.alert(
        'Invalid password',
        'New password must be at least 6 characters and include both letters and numbers.'
      )
      return
    }

    // Match check
    if (newPassword !== confirmPassword) {
      Alert.alert(
        'Passwords do not match',
        'Please make sure both passwords are the same.'
      )
      return
    }

    setUpdatingPassword(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    setUpdatingPassword(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    setNewPassword('')
    setConfirmPassword('')
    setShowPasswordModal(false)

    Alert.alert('Success', 'Password updated.')
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
          <Row label="View profile" onPress={() => setShowProfileModal(true)} />
          <Row label="Change University" onPress={() => setShowUniversityModal(true)} />
          <Row label="Change Password" onPress={() => setShowPasswordModal(true)} />
        </Section>

        <Section title="Contribute">
          <Row label="Submit a location" onPress={() => setShowLocationModal(true)} />
          <Row label="Report an issue" onPress={() => setShowIssueModal(true)} />
        </Section>

        <Section title="Legal">
          <Row label="Terms & Conditions" onPress={() => setShowTerms(true)} />
        </Section>

        <Section title="Account">
          <Row label="Sign out" onPress={() => setShowSignOutModal(true)} />
          <Row label="Delete account" onPress={() => setShowDeleteModal(true)} danger />
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
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowDeleteModal(false)} />

        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Delete Account?</Text>

          <Text style={styles.deleteText}>
            This will delete your profile data and sign you out. This action cannot be undone.
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowDeleteModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={deleteAccount}
              disabled={deletingAccount}
            >
              <Text style={styles.submitText}>
                {deletingAccount ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showProfileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowProfileModal(false)} />

        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Profile</Text>
            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
              <Ionicons name="close" size={22} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfoRow}>
            <Text style={styles.profileLabel}>Name</Text>
            <Text style={styles.profileValue}>
              {profile?.full_name || profileName || 'Not set'}
            </Text>
          </View>

          <View style={styles.profileInfoRow}>
            <Text style={styles.profileLabel}>Email</Text>
            <Text style={styles.profileValue}>{profileEmail || 'Not set'}</Text>
          </View>

          <View style={styles.profileInfoRow}>
            <Text style={styles.profileLabel}>University</Text>
            <Text style={styles.profileValue}>
              {profile?.university_name || 'Not set'}
            </Text>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showUniversityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUniversityModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowUniversityModal(false)} />

        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Change University</Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedUniversity}
              onValueChange={(val) => setSelectedUniversity(val)}
              style={{ height: 60 }}
              itemStyle={{ height: 50 }}
            >
              {universities.map((u) => (
                <Picker.Item key={u.id} label={u.name} value={u.id} />
              ))}
            </Picker>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowUniversityModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: primaryColor }]}
              onPress={updateUniversity}
            >
              <Text style={styles.submitText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowSignOutModal(false)}
        />

        <View style={styles.modalContainer}>
          <View style={styles.modalSheet}>
            <TouchableOpacity
              style={[styles.signOutBtn, { backgroundColor: primaryColor }]}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutText}>Confirm Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowPasswordModal(false)} />

        <View style={styles.modalContainer}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={22} color="#999" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor="#999"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                   backgroundColor: isReady ? primaryColor : '#ccc' 
                }
              ]}
              onPress={updatePassword}
              disabled={!newPassword || !confirmPassword}
            >
              <Text
                style={styles.submitText}
              >
                Update Password
              </Text>
            </TouchableOpacity>
          </View>
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
  paddingBottom: 32,
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
  paddingVertical: 14,
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
  deleteText: {
  fontSize: 14,
  color: '#555',
  lineHeight: 20,
  marginBottom: 16
  },
  deleteBtn: {
  flex: 1,
  paddingVertical: 14,
  borderRadius: 12,
  backgroundColor: '#C94040',
  alignItems: 'center'
  },
  profileInfoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  profileLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  profileValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500'
  },
  signOutModal: {
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center'
  },
  signOutBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  signOutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15
  }
})