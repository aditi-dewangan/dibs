import { useEffect, useState } from 'react'
import {
  ScrollView, View, Text, StyleSheet,
  ActivityIndicator, TouchableOpacity
} from 'react-native'
import { supabase } from '../lib/supabase'
import BusynessBar from './BusynessBar'

export default function ListView() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, study, food

  useEffect(() => {
    fetchLocations()
  }, [filter])

  async function fetchLocations() {
    setLoading(true)
    let query = supabase
        .from('locations')
        .select('*')
        .eq('status', 'approved')
        .order('name')

    if (filter !== 'all') {
        query = query.or(`type.eq.${filter},type.eq.both`)
    }

    const { data, error } = await query

    // ADD THESE
    console.log('locations data:', JSON.stringify(data))
    console.log('locations error:', JSON.stringify(error))

    if (!error) setLocations(data)
    setLoading(false)
  }

  return (
    <View style={styles.container}>

      {/* Filter Pills */}
      <View style={styles.pills}>
        {['all', 'study', 'food'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.pill, filter === f && styles.pillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>
              {f === 'all' ? 'All' : f === 'study' ? '📚 Study' : '🍔 Food'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#3B9E6B" />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {locations.map((loc) => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </ScrollView>
      )}
    </View>
  )
}

function LocationCard({ location }) {
  const [busyness, setBusyness] = useState(null)

  useEffect(() => {
    fetchBusyness()
  }, [])

  async function fetchBusyness() {
    const { data, error } = await supabase
      .rpc('get_busyness', { p_location_id: location.id })
    if (!error) setBusyness(data)
  }

  const attrs = location.attributes || {}

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardName}>{location.name}</Text>
          <Text style={styles.cardType}>
            {location.type === 'study' ? '📚 Study spot' :
             location.type === 'food' ? '🍔 Food spot' : '📚🍔 Study & Food'}
          </Text>
        </View>
      </View>

      {/* Busyness Bar */}
      <BusynessBar score={busyness?.score ?? 0} label={busyness?.label ?? 'no_data'} />

      {/* Attribute Tags */}
      <View style={styles.tags}>
        {attrs.wifi && <Tag label="WiFi" />}
        {attrs.outlets && <Tag label="Outlets" />}
        {attrs.open_late && <Tag label="Open Late" />}
        {attrs.noise_level && <Tag label={attrs.noise_level} />}
        {attrs.accepts_dining_dollars && <Tag label="Dining $" />}
        {attrs.outdoor_seating && <Tag label="Outdoor" />}
      </View>
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
  container: { flex: 1, backgroundColor: '#fff' },
  pills: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f2f2f2'
  },
  pillActive: { backgroundColor: '#3B9E6B' },
  pillText: { fontSize: 13, color: '#666', fontWeight: '500' },
  pillTextActive: { color: '#fff' },
  list: { padding: 16, gap: 12 },
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
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  cardName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  cardType: { fontSize: 12, color: '#999' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  tagText: { fontSize: 11, color: '#666' }
})