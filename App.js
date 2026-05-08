import { SafeAreaProvider } from 'react-native-safe-area-context'
import AuthGate from './app/auth/AuthGate'
import { ThemeProvider } from './lib/ThemeContext'
import GetStartedScreen from './app/auth/GetStartedScreen'
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold
} from '@expo-google-fonts/nunito'

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  })

  if (!fontsLoaded) return null
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthGate />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}