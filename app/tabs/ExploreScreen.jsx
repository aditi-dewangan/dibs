import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import ListView from '../../components/ListView'
import MapView2 from '../../components/MapView2'
import FilterModal from '../../components/FilterModal'
import { useTheme } from '../../lib/ThemeContext'
import DibsLogo from '../../components/DibsLogo'
import {View, Text, TouchableOpacity, StyleSheet, TextInput} from 'react-native'

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
  const [searchQuery, setSearchQuery] = useState('')

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
    <SafeAreaView style={[styles.container, { backgroundColor: primaryColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <View style={styles.logoRow}>
          <DibsLogo size={32} color="#fff" fill={primaryColor} />
          <Text style={styles.appName}>ibs</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.filterBtn, hasFilters && styles.filterBtnActive]}
            onPress={() => setShowFilter(true)}
          >
            <Ionicons
              name="options-outline"
              size={16}
              color={hasFilters ? primaryColor : '#fff'}
            />

            {activeFilterCount > 0 && (
              <Text style={[styles.filterCount, { color: primaryColor }]}>
                {activeFilterCount}
              </Text>
            )}
          </TouchableOpacity>

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

      {/* Content area */}
      <View style={styles.contentArea}>
        {activeView === 'list' && (
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={16} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search spots..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}

        {activeView === 'list' ? (
          <ListView
            typeFilter={typeFilter}
            activeAttrs={activeAttrs}
            attrMatch={ATTRIBUTE_MATCH}
            searchQuery={searchQuery}
          />
        ) : (
          <MapView2
            typeFilter={typeFilter}
            activeAttrs={activeAttrs}
            attrMatch={ATTRIBUTE_MATCH}
          />
        )}
      </View>

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
    paddingVertical: 8,
  },
  appName: {
    fontSize: 30,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
    lineHeight: 40,
    marginLeft: -4
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  tabBarStyle: {
    height: 82,
    paddingBottom: 4,
    paddingTop: 10,
    borderTopWidth: 0
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -2
  },
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
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  filterBtnActive: {
    backgroundColor: '#fff'
  },
  filterCount: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  },
  toggleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Nunito_500Regular'
  },
  toggleTextActive: {
    fontFamily: 'Nunito_600SemiBold',
    color: '#1a1a1a'
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#f2f2f2'
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a'
  }
})