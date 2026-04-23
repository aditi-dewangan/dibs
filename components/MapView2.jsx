import { View, Text, StyleSheet } from 'react-native'

export default function MapView2() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map coming soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' },
  text: { fontSize: 18, color: '#999' }
})