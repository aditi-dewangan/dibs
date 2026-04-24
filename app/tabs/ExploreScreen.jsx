import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import ListView from '../../components/ListView'
import MapView2 from '../../components/MapView2'
import FilterModal from '../../components/FilterModal'
import { useTheme } from '../../lib/ThemeContext'

const ATTRIBUTE_MATCH = {
  wifi:     (a) => a.wifi === true,
  quiet:    (a) => a.noise_level === 'quiet',
  open_late:(a) => a.open_late === true,
  dining:   (a) => a.accepts_dining_dollars === true,
  outdoor:  (a) => a.outdoor_seating === true,
}

export default function ExploreScreen() {
  const [activeView, setActiveView] = useState('list')
  const [showFilter, setShowFilter] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [activeAttrs, setActiveAttrs] = useState([])
  const { primaryColor } = useTheme()

  function toggleAttr(key) {
    setActiveAttrs(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  function clearFilters() {
    setTypeFilter('all')
    setActiveAttrs([])
  }

  const hasFilters = typeFilter !== 'all' || activeAttrs.length > 0
  const activeFilterCount = (typeFilter !== 'all' ? 1 : 0) + activeAttrs.length

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: primaryColor }]}>
        <Text style={[styles.appName, { color: primaryColor }]}>Dibs</Text>
        <View style={styles.headerRight}>

          {/* Filter button */}
          <TouchableOpacity
            style={[styles.filterBtn, hasFilters && { backgroundColor: primaryColor }]}
            onPress={() => setShowFilter(true)}
          >
            <Ionicons
              name="options-outline"
              size={16}
              color={hasFilters ? '#fff' : '#555'}
            />
            {activeFilterCount > 0 && (
              <Text style={styles.filterCount}>{activeFilterCount}</Text>
            )}
          </TouchableOpacity>

          {/* List/Map toggle */}
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
      </View>

      {/* Content */}
      {activeView === 'list'
        ? <ListView typeFilter={typeFilter} activeAttrs={activeAttrs} attrMatch={ATTRIBUTE_MATCH} />
        : <MapView2 typeFilter={typeFilter} activeAttrs={activeAttrs} attrMatch={ATTRIBUTE_MATCH} />
      }

      {/* Filter Modal */}
      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        activeAttrs={activeAttrs}
        toggleAttr={toggleAttr}
        onClear={clearFilters}
      />

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  appName: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f2f2f2'
  },
  filterCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff'
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
  toggleText: { fontSize: 14, color: '#999', fontWeight: '500' },
  toggleTextActive: { color: '#1a1a1a', fontWeight: '600' }
})