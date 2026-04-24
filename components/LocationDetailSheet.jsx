import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, Linking, Pressable, Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import BusynessBar from './BusynessBar'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import MapView, { Marker } from 'react-native-maps'
import { useTheme } from '../lib/ThemeContext'

function Tag({ label }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  )
}

function MiniMap({ lat, lng, name, primaryColor }) {
  return (
    <MapView
      style={styles.miniMap}
      initialRegion={{
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      }}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      showsPointsOfInterest={false}
      showsBuildings={false}
    >
      <Marker
        coordinate={{ latitude: lat, longitude: lng }}
      >
        <View style={styles.miniPin}>
          <View style={[styles.miniPinDot, { backgroundColor: primaryColor }]} />
        </View>
      </Marker>
    </MapView>
  )
}

function ActionButton({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.actionBtn, { borderColor: color }]} onPress={onPress}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.actionBtnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function LocationDetailSheet({ location, visible, onClose }) {
  const [busyness, setBusyness] = useState(null)
  const { primaryColor } = useTheme()

  useEffect(() => {
    if (location) fetchBusyness()
  }, [location])

  async function fetchBusyness() {
    const { data } = await supabase
      .rpc('get_busyness', { p_location_id: location.id })
    if (data) setBusyness(data)
  }

  function openDirections() {
    const url = Platform.select({
      ios: `maps:0,0?daddr=${location.lat},${location.lng}`,
      android: `geo:0,0?q=${location.lat},${location.lng}`
    })
    // Try Apple Maps first on iOS, fallback to Google Maps
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url)
      } else {
        Linking.openURL(`https://maps.google.com/?daddr=${location.lat},${location.lng}`)
      }
    })
  }

  function openWebsite() {
    if (location.website_url) {
      Linking.openURL(location.website_url)
    }
  }

  if (!location) return null

  const attrs = location.attributes || {}

  const attrTags = [
    attrs.wifi && 'WiFi',
    attrs.open_late && 'Open Late',
    attrs.noise_level && attrs.noise_level.charAt(0).toUpperCase() + attrs.noise_level.slice(1),
    attrs.accepts_dining_dollars && 'Dining $',
    attrs.outdoor_seating && 'Outdoor Seating',
    attrs.group_rooms && 'Group Rooms',
    attrs.printer && 'Printer',
    attrs.vegetarian_options && 'Vegetarian Options',
  ].filter(Boolean)

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Dim backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={20} color="#999" />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          <MiniMap
            lat={location.lat}
            lng={location.lng}
            name={location.name}
            primaryColor={primaryColor}
            />
          {/* Name & type */}
          <Text style={styles.name}>{location.name}</Text>
          <Text style={styles.type}>
            {location.type === 'study' ? '📚 Study spot' :
             location.type === 'food' ? '🍔 Food spot' : '📚🍔 Study & Food'}
          </Text>

          {/* Address */}
          {location.address && (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={14} color="#aaa" />
              <Text style={styles.address}>{location.address}</Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Busyness */}
          <Text style={styles.sectionLabel}>How busy right now</Text>
          <BusynessBar
            score={busyness?.score ?? 0}
            label={busyness?.label ?? 'no_data'}
          />

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          {location.description && (
            <>
              <Text style={styles.sectionLabel}>About</Text>
              <Text style={styles.description}>{location.description}</Text>
              <View style={styles.divider} />
            </>
          )}

          {/* Attributes */}
          {attrTags.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Amenities</Text>
              <View style={styles.tags}>
                {attrTags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </View>
              <View style={styles.divider} />
            </>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <ActionButton
                icon="navigate-outline"
                label="Directions"
                color={primaryColor}
                />
            {location.website_url && (
              <ActionButton
                icon="globe-outline"
                label="Website"
                color="#5B8DEF"
                onPress={openWebsite}
              />
            )}
          </View>

          {/* Busyness detail */}
          {busyness && busyness.label !== 'no_data' && (
            <Text style={styles.busynessDetail}>
              {busyness.survey_count > 0
                ? `Based on ${busyness.survey_count} recent ${busyness.survey_count === 1 ? 'report' : 'reports'}${busyness.gps_user_count ? ` and ${busyness.gps_user_count} users nearby` : ''}`
                : busyness.gps_user_count
                ? `${busyness.gps_user_count} users detected nearby`
                : null
              }
            </Text>
          )}

        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    maxHeight: '85%'
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 4
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    paddingRight: 32
  },
  type: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4
  },
  address: {
    fontSize: 13,
    color: '#aaa'
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tag: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  tagText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500'
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600'
  },
  busynessDetail: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 4
  },
  miniMap: {
  width: '100%',
  height: 130,
  borderRadius: 14,
  overflow: 'hidden',
  marginBottom: 16
    },
    miniPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 158, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
    },
    miniPinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    }
})