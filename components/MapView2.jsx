import { useEffect, useState, useRef } from 'react'
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import BusynessBar from './BusynessBar'
import LocationDetailSheet from './LocationDetailSheet'
import {
  BUSYNESS_COLOR_LOW,
  BUSYNESS_COLOR_MEDIUM,
  BUSYNESS_COLOR_HIGH
} from '../components/config'
import { PanResponder, Animated } from 'react-native'
import { useTheme } from '../lib/ThemeContext'

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

function Tag({ label }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  )
}

export default function MapView2() {
  const [locations, setLocations] = useState([])
  const [busynessMap, setBusynessMap] = useState({})
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef(null)
  const slideAnim = useRef(new Animated.Value(0)).current
  const { primaryColor } = useTheme()

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy < -10,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) {
          setShowDetail(true)
        }
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true
        }).start()
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          slideAnim.setValue(gestureState.dy)
        }
      }
    })
  ).current

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
    setShowDetail(false)
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
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    )
  }

  const busyness = selectedLocation ? busynessMap[selectedLocation.id] : null

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
              <View style={[
                styles.pin,
                loc.type === 'both' && styles.pinWide,
                { backgroundColor: pinColor }
              ]}>
                <Text style={[
                  styles.pinEmoji,
                  loc.type === 'both' && styles.pinEmojiSmall
                ]}>
                  {loc.type === 'study' ? '📚' : loc.type === 'food' ? '🍔' : '📚🍔'}
                </Text>
              </View>
            </Marker>
          )
        })}
      </MapView>

      {/* Dismiss overlay */}
      {selectedLocation && (
        <TouchableOpacity
          style={styles.dismissOverlay}
          onPress={() => {
            setSelectedLocation(null)
            setShowDetail(false)
          }}
          activeOpacity={1}
        />
      )}

      {/* Bottom card — now Animated.View with swipe */}
      {selectedLocation && (
        <Animated.View
          style={[
            styles.bottomCard,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Handle area — swipe up to open full details */}
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={styles.cardHandle} />
          </View>

          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{selectedLocation.name}</Text>
              <Text style={styles.cardType}>
                {selectedLocation.type === 'study' ? '📚 Study spot' :
                 selectedLocation.type === 'food' ? '🍔 Food spot' : '📚🍔 Study & Food'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => {
              setSelectedLocation(null)
              setShowDetail(false)
            }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <BusynessBar
            score={busyness?.score ?? 0}
            label={busyness?.label ?? 'no_data'}
          />

          <View style={styles.tags}>
            {selectedLocation.attributes?.wifi && <Tag label="WiFi" />}
            {selectedLocation.attributes?.outlets && <Tag label="Outlets" />}
            {selectedLocation.attributes?.open_late && <Tag label="Open Late" />}
            {selectedLocation.attributes?.noise_level && <Tag label={selectedLocation.attributes.noise_level} />}
            {selectedLocation.attributes?.accepts_dining_dollars && <Tag label="Dining $" />}
            {selectedLocation.attributes?.outdoor_seating && <Tag label="Outdoor" />}
          </View>

          <TouchableOpacity
            style={styles.moreInfoBtn}
            onPress={() => setShowDetail(true)}
          >
            <Text style={[styles.moreInfoText, { color: primaryColor }]}>View Full Details</Text>
            <Ionicons name="chevron-up" size={14} color={primaryColor} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Detail sheet — sibling to map, outside bottomCard */}
      <LocationDetailSheet
        location={selectedLocation}
        visible={showDetail}
        onClose={() => setShowDetail(false)}
      />
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
  pinWide: {
    width: 48,
    borderRadius: 24,
  },
  pinEmoji: {
    fontSize: 16
  },
  pinEmojiSmall: {
    fontSize: 13
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
  tagText: { fontSize: 11, color: '#666' },
  moreInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f0faf5'
  },
  handleArea: {
  paddingVertical: 8,
  alignItems: 'center',
  marginBottom: 8
  },
  moreInfoText: {
    fontSize: 14,
    fontWeight: '600'
  }
})