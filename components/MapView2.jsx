import { useEffect, useState, useRef } from 'react'
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, ScrollView, Dimensions
} from 'react-native'
import MapView, { Marker, Circle } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'
import BusynessBar from './BusynessBar'
import {
  BUSYNESS_COLOR_LOW,
  BUSYNESS_COLOR_MEDIUM,
  BUSYNESS_COLOR_HIGH
} from '../components/config'

const { height } = Dimensions.get('window')

// University of Washington default center
const UW_REGION = {
  latitude: 47.6553,
  longitude: -122.3035,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
}

function getPinColor(label) {
  switch (label) {
    case 'not_busy': return BUSYNESS_COLOR_LOW
    case 'somewhat_busy': return BUSYNESS_COLOR_MEDIUM
    case 'very_busy': return BUSYNESS_COLOR_HIGH
    default: return '#aaaaaa'
  }
}

export default function MapView2() {
  const [locations, setLocations] = useState([])
  const [busynessMap, setBusynessMap] = useState({})
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  async function fetchLocations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('status', 'approved')

    if (!error && data) {
      setLocations(data)
      fetchAllBusyness(data)
    }
    setLoading(false)
  }

  async function fetchAllBusyness(locs) {
    const results = {}
    await Promise.all(
      locs.map(async (loc) => {
        const { data } = await supabase
          .rpc('get_busyness', { p_location_id: loc.id })
        if (data) results[loc.id] = data
      })
    )
    setBusynessMap(results)
  }

  function handlePinPress(location) {
    setSelectedLocation(location)
    // Animate map to center slightly above the pin to make room for the card
    mapRef.current?.animateToRegion({
      latitude: location.lat - 0.002,
      longitude: location.lng,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    }, 400)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B9E6B" />
      </View>
    )
  }

  const selected = selectedLocation
  const busyness = selected ? busynessMap[selected.id] : null

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={UW_REGION}
        showsUserLocation
        showsMyLocationButton
      >
        {locations.map((loc) => {
          const b = busynessMap[loc.id]
          const pinColor = getPinColor(b?.label)
          return (
            <Marker
              key={loc.id}
              coordinate={{ latitude: loc.lat, longitude: loc.lng }}
              onPress={() => handlePinPress(loc)}
            >
              {/* Custom pin */}
              <View style={[styles.pin, loc.type === 'both' && styles.pinWide, { backgroundColor: pinColor }]}>
                <Text style={[styles.pinEmoji, loc.type === 'both' && styles.pinEmojiSmall]}>
                    {loc.type === 'study' ? '📚' : loc.type === 'food' ? '🍔' : '📚🍔'}
                </Text>
              </View>
            </Marker>
          )
        })}
      </MapView>

      {/* Dismiss tap area when card is open */}
      {selectedLocation && (
        <TouchableOpacity
          style={styles.dismissOverlay}
          onPress={() => setSelectedLocation(null)}
          activeOpacity={1}
        />
      )}

      {/* Bottom location card */}
      {selectedLocation && (
        <View style={styles.bottomCard}>
          <View style={styles.cardHandle} />

          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{selectedLocation.name}</Text>
              <Text style={styles.cardType}>
                {selectedLocation.type === 'study' ? '📚 Study spot' :
                 selectedLocation.type === 'food' ? '🍔 Food spot' : '📚🍔 Study & Food'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedLocation(null)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <BusynessBar
            score={busyness?.score ?? 0}
            label={busyness?.label ?? 'no_data'}
          />

          {/* Attribute tags */}
          <View style={styles.tags}>
            {selectedLocation.attributes?.wifi &&
              <Tag label="WiFi" />}
            {selectedLocation.attributes?.outlets &&
              <Tag label="Outlets" />}
            {selectedLocation.attributes?.open_late &&
              <Tag label="Open Late" />}
            {selectedLocation.attributes?.noise_level &&
              <Tag label={selectedLocation.attributes.noise_level} />}
            {selectedLocation.attributes?.accepts_dining_dollars &&
              <Tag label="Dining $" />}
            {selectedLocation.attributes?.outdoor_seating &&
              <Tag label="Outdoor" />}
          </View>
        </View>
      )}
    </View>
  )
}

function Tag({ label }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  map: {
    flex: 1
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4
  },
  pinEmoji: {
    fontSize: 16
  },
  dismissOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent'
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10
  },
  cardHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2
  },
  cardType: {
    fontSize: 12,
    color: '#999'
  },
  closeBtn: {
    fontSize: 16,
    color: '#aaa',
    padding: 4
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12
  },
  tag: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  pinWide: {
  width: 48,
  borderRadius: 24,
 },
pinEmojiSmall: {
  fontSize: 13
 },
  tagText: { fontSize: 11, color: '#666' }
})