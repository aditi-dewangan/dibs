import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Location from 'expo-location'
import { useTheme } from '../../lib/ThemeContext'
import DibsLogo from '../../components/DibsLogo'
import { Modal, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PrivacyPolicy from '../../lib/terms'


const onboardingData = [
  {
    title: 'Welcome to Dibs',
    body: 'Beat the rush. Check how busy campus study and food spots are before you go.',
    button: 'Get Started',
    showLogo: true
  },
  {
    title: 'Why we use your location',
    body: 'Dibs uses your location to:\n\n• show nearby campus spots\n• help estimate how busy places are\n• improve recommendations around you',
    button: 'Continue',
    showLogo: false
  },
  {
    title: "You're in control",
    body: 'Your location helps Dibs work better. We are not following or stalking you, we promise.',
    button: 'Continue',
    showLogo: false
  },
  {
    title: 'Allow location access',
    body: 'When the next popup appears, allow location access so Dibs can accurately show how busy campus is.',
    button: 'Turn On Location',
    showLogo: false
  }
]


export default function GetStartedScreen({ onDone }) {
  const [currentPage, setCurrentPage] = useState(0)
  const { primaryColor } = useTheme()
  const [showTerms, setShowTerms] = useState(false)
  const currentData = onboardingData[currentPage]

  async function handleNext() {
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1)
      return
    }

    const foreground = await Location.requestForegroundPermissionsAsync()

    if (foreground.status !== 'granted') {
      Alert.alert(
        'Location not enabled',
        'You can still use Dibs, but nearby spots and busyness accuracy may be limited.'
      )
      onDone?.()
      return
    }

    onDone?.()
  }

  function handleBack() {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Top logo */}
        <View style={styles.topLogoRow}>
          <DibsLogo size={32} color={ primaryColor} />
          <Text style={styles.appName}>Dibs</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressBar,
                {
                  backgroundColor:
                    index === currentPage
                      ? primaryColor
                      : index < currentPage
                      ? '#D1D5DB'
                      : '#E5E7EB'
                }
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {currentData.showLogo && (
            <View style={styles.heroLogo}>
              <DibsLogo size={80} color={primaryColor} fill="#fff" />
            </View>
          )}

          <Text style={styles.title}>{currentData.title}</Text>
          <Text style={styles.body}>{currentData.body}</Text>
        {currentPage === 1 && (
        <TouchableOpacity onPress={() => setShowTerms(true)}>
            <Text style={[styles.learnMoreText, { color: primaryColor }]}>
            Learn More
            </Text>
        </TouchableOpacity>
        )}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: primaryColor }
            ]}
            onPress={handleNext}
          >
            <Text style={styles.primaryBtnText}>{currentData.button}</Text>
          </TouchableOpacity>

          {currentPage > 0 && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleBack}>
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
        <Modal
            visible={showTerms}
            transparent
            animationType="slide"
            onRequestClose={() => setShowTerms(false)}
            >
            <View style={styles.modalOverlay}>
                <Pressable
                style={styles.modalBackdrop}
                onPress={() => setShowTerms(false)}
                />

                <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Privacy Policy</Text>

                    <TouchableOpacity onPress={() => setShowTerms(false)}>
                    <Ionicons name="close" size={22} color={primaryColor} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <PrivacyPolicy />
                </ScrollView>
                </View>
            </View>
        </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24
  },
  topLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32
  },
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  appName: {
    fontSize: 26,
    fontFamily: 'Nunito_700Bold',
    color: '#1a1a1a'
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 56
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 8
  },
  content: {
    flex: 1
  },
  heroLogo: {
    marginBottom: 44
  },
  title: {
    fontSize: 30,
    fontFamily: 'Nunito_700Bold',
    color: '#1a1a1a',
    marginBottom: 14
  },
  body: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: '#666',
    lineHeight: 24
  },
  buttons: {
    gap: 12,
    marginBottom: 8
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center'
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#1a1a1a'
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center'
  },
  secondaryBtnText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: '#777'
  },
  learnMoreText: {
    marginTop: 14,
    fontFamily: 'Nunito_700Bold',
    textDecorationLine: 'underline'
  },
    modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)'
    },
    modalBackdrop: {
    ...StyleSheet.absoluteFillObject
    },
    modalSheet: {
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    height: '60%'
    },
    modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
    },
    modalTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    color: '#1a1a1a'
    },
    termsText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#444',
    lineHeight: 22,
    paddingBottom: 24
    }
})