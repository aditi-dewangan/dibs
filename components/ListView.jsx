import { useEffect, useState } from 'react'
import {
  ScrollView, View, StyleSheet,
  ActivityIndicator
} from 'react-native'
import { supabase } from '../lib/supabase'
import LocationCard from './LocationCard'
import { useTheme } from '../lib/ThemeContext'

export default function ListView({ typeFilter = 'all', activeAttrs = [], attrMatch = {} }) {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const { primaryColor } = useTheme()

  useEffect(() => {
    fetchLocations()
  }, [typeFilter])

  async function fetchLocations() {
    setLoading(true)
    let query = supabase
      .from('locations')
      .select('*')
      .eq('status', 'approved')
      .order('name')

    if (typeFilter !== 'all') {
      query = query.or(`type.eq.${typeFilter},type.eq.both`)
    }

    const { data, error } = await query
    if (!error) setLocations(data)
    setLoading(false)
  }

  // Apply attribute filters client-side
  const filtered = activeAttrs.length > 0
    ? locations.filter(loc =>
        activeAttrs.every(key => attrMatch[key]?.(loc.attributes || {}))
      )
    : locations

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} />

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {filtered.map((loc) => (
        <LocationCard key={loc.id} location={loc} />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  list: { padding: 16 }
})