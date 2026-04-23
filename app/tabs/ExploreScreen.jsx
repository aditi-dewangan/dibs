import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ListView from '../../components/ListView'
import MapView2 from '../../components/MapView2'

export default function ExploreScreen() {
  const [activeView, setActiveView] = useState('list')

  return (
    <SafeAreaView style={styles.container}>

      {/* Toggle Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>Dibs</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeView === 'list' && styles.toggleActive]}
            onPress={() => setActiveView('list')}
          >
            <Text style={[styles.toggleText, activeView === 'list' && styles.toggleTextActive]}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, activeView === 'map' && styles.toggleActive]}
            onPress={() => setActiveView('map')}
          >
            <Text style={[styles.toggleText, activeView === 'map' && styles.toggleTextActive]}>
              Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {activeView === 'list' ? <ListView /> : <MapView2 />}

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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a'
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    padding: 3
  },
  toggleBtn: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 18
  },
  toggleActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2
  },
  toggleText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500'
  },
  toggleTextActive: {
    color: '#1a1a1a',
    fontWeight: '600'
  }
})