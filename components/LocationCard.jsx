import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { supabase } from '../lib/supabase'
import BusynessBar from './BusynessBar'
import LocationDetailSheet from './LocationDetailSheet'
import { Ionicons } from '@expo/vector-icons'

function Tag({ label }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  )
}

export default function LocationCard({ location, isFavorite = false, onToggleFavorite }){
  const [busyness, setBusyness] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    fetchBusyness()
  }, [])

  async function fetchBusyness() {
    const { data } = await supabase
      .rpc('get_busyness', { p_location_id: location.id })
    if (data) setBusyness(data)
  }

  const attrs = location.attributes || {}

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setShowDetail(true)}
        activeOpacity={0.85}
      >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.cardName}>{location.name}</Text>
          <Text style={styles.cardType}>
            {location.type === 'study' ? '📚 Study spot' :
            location.type === 'food' ? '🍔 Food spot' : '📚🍔 Study & Food'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.heartBtn}
          onPress={(e) => {
            e.stopPropagation()
            onToggleFavorite?.(location.id)
          }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#E53935' : '#aaa'}
          />
        </TouchableOpacity>
      </View>

        <BusynessBar
          score={busyness?.score ?? 0}
          label={busyness?.label ?? 'no_data'}
        />

        <View style={styles.tags}>
          {attrs.wifi && <Tag label="WiFi" />}
          {attrs.open_late && <Tag label="Open Late" />}
          {attrs.noise_level && <Tag label={attrs.noise_level} />}
          {attrs.accepts_dining_dollars && <Tag label="Dining $" />}
          {attrs.outdoor_seating && <Tag label="Outdoor" />}
        </View>
      </TouchableOpacity>

      <LocationDetailSheet
        location={location}
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  cardName: { fontSize: 16, fontFamily: 'Nunito_700SemiBold', color: '#1a1a1a', marginBottom: 2 },
  cardType: { fontSize: 12, color: '#999' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  tagText: { fontSize: 11, color: '#666' },
  heartBtn: {
    padding: 4
  }
})