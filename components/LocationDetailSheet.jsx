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
import * as Location from 'expo-location'
import { SURVEY_COOLDOWN_MINUTES } from './config'

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

export default function LocationDetailSheet({
    location,
    visible,
    onClose,
    isFavorite = false,
    onToggleFavorite
  }) {
  const [busyness, setBusyness] = useState(null)
  const { primaryColor } = useTheme()

  const [userCoords, setUserCoords] = useState(null)
  const [accurateAnswer, setAccurateAnswer] = useState(null)
  const [busynessRating, setBusynessRating] = useState(null)
  const [surveyCooldown, setSurveyCooldown] = useState(false)

  useEffect(() => {
    async function getLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return

      const pos = await Location.getCurrentPositionAsync({})
      setUserCoords(pos.coords)
    }

    if (visible) getLocation()
  }, [visible])

  useEffect(() => {
    if (location) fetchBusyness()
  }, [location?.id])

  async function fetchBusyness() {
    const { data } = await supabase
      .rpc('get_busyness', { p_location_id: location.id })
    if (data) setBusyness(data)
  }

  function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000

    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const distanceMeters =
    userCoords && location
      ? getDistanceMeters(
          userCoords.latitude,
          userCoords.longitude,
          location.lat,
          location.lng
        )
      : null

  const canSubmitSurvey =
    distanceMeters !== null && distanceMeters <= 100
    
  async function submitSurvey(nextAccurate, nextRating) {
    if (!canSubmitSurvey || surveyCooldown) return
    if (nextAccurate === null || nextRating === null) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('busyness_surveys')
      .insert({
        user_id: user.id,
        location_id: location.id,
        accurate: nextAccurate,
        busyness_rating: nextRating
      })

    if (error) {
      console.log('SURVEY ERROR:', error)
      return
    }

    setAccurateAnswer(null)
    setBusynessRating(null)
    setSurveyCooldown(true)

    setTimeout(() => {
      setSurveyCooldown(false)
    }, SURVEY_COOLDOWN_MINUTES * 60 * 1000)
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
          <View style={styles.nameRow}>
            <Text style={styles.name}>{location.name}</Text>

            <TouchableOpacity
              style={styles.detailHeartBtn}
              onPress={() => onToggleFavorite?.(location.id)}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#E53935' : '#aaa'}
              />
            </TouchableOpacity>
          </View>
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

          <View style={styles.surveyBox}>
          {!canSubmitSurvey && (
            <Text style={styles.surveyWarning}>
              Must be within 100 meters of {location.name} to submit survey.
            </Text>
          )}

          {surveyCooldown && (
            <Text style={styles.surveyCooldown}>
              Next survey can be answered in 15 minutes.
            </Text>
          )}

          <View style={styles.surveyRow}>
            <Text style={styles.surveyQuestion}>Is this info accurate?</Text>

            {['Yes', 'No'].map((label) => {
              const value = label === 'Yes'
              const active = accurateAnswer === value

              return (
                <TouchableOpacity
                  key={label}
                  disabled={!canSubmitSurvey || surveyCooldown}
                  style={[
                    styles.surveyOption,
                    !canSubmitSurvey && styles.surveyOptionDisabled,
                    active && { backgroundColor: primaryColor }
                  ]}
                  onPress={() => {
                    setAccurateAnswer(value)
                    submitSurvey(value, busynessRating)
                  }}
                >
                  <Text
                    style={[
                      styles.surveyOptionText,
                      active && { color: '#fff' }
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

  <View style={styles.surveyRow}>
      <Text style={styles.surveyQuestion}>Rate busyness:</Text>

      {[1, 2, 3, 4, 5].map((num) => {
        const active = busynessRating === num

        return (
          <TouchableOpacity
            key={num}
            disabled={!canSubmitSurvey || surveyCooldown}
            style={[
              styles.ratingCircle,
              !canSubmitSurvey && styles.surveyOptionDisabled,
              active && { backgroundColor: primaryColor }
            ]}
            onPress={() => {
              setBusynessRating(num)
              submitSurvey(accurateAnswer, num)
            }}
          >
            <Text
              style={[
                styles.ratingText,
                active && { color: '#fff' }
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  </View>

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
    fontFamily: 'Inter_600SemiBold',
    color: '#1a1a1a',
    marginBottom: 4,
    flex: 1
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
    fontFamily: 'Inter_600SemiBold',
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
    fontFamily: 'Nunito_500Regular'
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
    fontFamily: 'Nunito_600SemiBold'
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
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    },
    detailHeartBtn: {
      padding: 6
    },
    surveyBox: {
  marginTop: 12
  },
  surveyWarning: {
    fontSize: 12,
    color: '#C94040',
    marginBottom: 8,
    fontFamily: 'Nunito_600SemiBold'
  },
  surveyCooldown: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Nunito_600SemiBold'
  },
  surveyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8
  },
  surveyQuestion: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    fontFamily: 'Nunito_600SemiBold'
  },
  surveyOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#e0e0e0'
  },
  surveyOptionDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.6
  },
  surveyOptionText: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'Nunito_700Bold'
  },
  ratingCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ratingText: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'Nunito_700Bold'
  }
})