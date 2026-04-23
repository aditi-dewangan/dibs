import { SafeAreaProvider } from 'react-native-safe-area-context'
import AuthGate from './app/auth/AuthGate'

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthGate />
    </SafeAreaProvider>
  )
}