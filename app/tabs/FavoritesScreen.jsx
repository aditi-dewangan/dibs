import { useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import LocationCard from '../../components/LocationCard'
import { useTheme } from '../../lib/ThemeContext'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'

export default function FavoritesScreen() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const { primaryColor } = useTheme()

  useFocusEffect(
    useCallback(() => {
      fetchFavorites()
    }, [])
  )

  async function fetchFavorites() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    // 1. get favorite ids
    const { data: favs, error: favError } = await supabase
      .from('favorites')
      .select('location_id')
      .eq('user_id', user.id)

    if (favError) {
      console.log('FAVORITES ERROR:', favError)
      setLoading(false)
      return
    }

    const ids = favs?.map(f => f.location_id) || []

    // 2. get locations from those ids
    if (ids.length === 0) {
      setLocations([])
      setLoading(false)
      return
    }

    const { data: locs, error: locError } = await supabase
      .from('locations')
      .select('*')
      .in('id', ids)

    if (locError) {
      console.log('LOCATIONS ERROR:', locError)
    } else {
      setLocations(locs || [])
    }

    setLoading(false)
  }

  async function toggleFavorite(locationId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('location_id', locationId)

    if (!error) {
      setLocations(prev => prev.filter(loc => loc.id !== locationId))
    }
  }

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} />
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        {locations.map((loc) => (
          <LocationCard
            key={loc.id}
            location={loc}
            isFavorite={true}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16 }
})