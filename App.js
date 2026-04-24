import { SafeAreaProvider } from 'react-native-safe-area-context'
import AuthGate from './app/auth/AuthGate'
import { ThemeProvider } from './lib/ThemeContext'

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthGate />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}