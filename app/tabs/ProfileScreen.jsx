import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  button: { backgroundColor: '#C94040', borderRadius: 10, padding: 14, paddingHorizontal: 32 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 }
})