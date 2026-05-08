import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const ThemeContext = createContext({
  primaryColor: '#3b9e8aff',
  secondaryColor: '#2d7a6dff',
})

export function ThemeProvider({ children }) {
  const [primaryColor, setPrimaryColor] = useState('#3b9e8aff')
  const [secondaryColor, setSecondaryColor] = useState('#2d7a6dff')

  useEffect(() => {
    loadTheme()
  }, [])

  async function loadTheme() {
    // Get current user's profile to find their university
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('university_id')
      .eq('id', user.id)
      .single()

    if (!profile?.university_id) return

    const { data: university } = await supabase
      .from('universities')
      .select('primary_color, secondary_color')
      .eq('id', profile.university_id)
      .single()

    if (university) {
      setPrimaryColor(university.primary_color)
      setSecondaryColor(university.secondary_color)
    }
  }

  return (
    <ThemeContext.Provider value={{ primaryColor, secondaryColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}