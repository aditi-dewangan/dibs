import { useEffect, useState } from 'react'
import {
  ScrollView, View, StyleSheet,
  ActivityIndicator
} from 'react-native'
import { supabase } from '../lib/supabase'
import LocationCard from './LocationCard'
import { useTheme } from '../lib/ThemeContext'

export default function ListView({
  typeFilter = 'all',
  activeAttrs = [],
  attrMatch = {},
  searchQuery = ''
  }) {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const { primaryColor } = useTheme()
  const [favoriteIds, setFavoriteIds] = useState([])


  useEffect(() => {
    fetchLocations()
  }, [typeFilter])

  useEffect(() => {
    fetchFavorites()
  }, [])

  async function fetchFavorites() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('favorites')
      .select('location_id')
      .eq('user_id', user.id)

    setFavoriteIds(data?.map(f => f.location_id) || [])
  }

  async function toggleFavorite(locationId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isFav = favoriteIds.includes(locationId)

    if (isFav) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('location_id', locationId)

      setFavoriteIds(prev => prev.filter(id => id !== locationId))
    } else {
      await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          location_id: locationId
        })

      setFavoriteIds(prev => [...prev, locationId])
    }
  }
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

  const searched = searchQuery.trim().length > 0
  ? filtered.filter(loc => {
      const q = searchQuery.toLowerCase()
      return (
        loc.name?.toLowerCase().includes(q) ||
        loc.description?.toLowerCase().includes(q)
      )
    })
  : filtered

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} />

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {searched.map((loc) => (
        <LocationCard
          key={loc.id}
          location={loc}
          isFavorite={favoriteIds.includes(loc.id)}
          onToggleFavorite={toggleFavorite}
        />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  list: { padding: 16 }
})