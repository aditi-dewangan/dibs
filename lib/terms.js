import { ScrollView, Text, StyleSheet } from 'react-native'

export default function PrivacyPolicy() {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.termsText}>
        Last Updated: May 2026{'\n\n'}
        Dibs is committed to protecting your privacy and being transparent about how we collect, use, and safeguard your information. This Privacy Policy explains what information we collect, how we use it, and the choices you have when using the Dibs mobile application and related services.
      </Text>

      <Text style={styles.sectionHeader}>Information We Collect</Text>
      <Text style={styles.termsText}>
        Dibs collects information necessary to provide and improve the app experience for students using campus study and food spaces.
      </Text>

      <Text style={styles.sectionHeader}>Account Information</Text>
      <Text style={styles.termsText}>
        When you create an account, we may collect:{'\n'}
        • your name{'\n'}
        • email address{'\n'}
        • university affiliation{'\n'}
        • authentication information provided through our sign-in system
      </Text>

      <Text style={styles.sectionHeader}>Location Information</Text>
      <Text style={styles.termsText}>
        With your permission, Dibs may collect your device location while using the app. Location data helps:{'\n'}
        • show nearby campus locations{'\n'}
        • improve busyness estimates{'\n'}
        • personalize recommendations{'\n'}
        • enhance map functionality{'\n\n'}
        Dibs does not use your location to track your movements outside of app-related functionality.{'\n\n'}
        You may disable location access at any time through your device settings, though some app features may become limited.
      </Text>

      <Text style={styles.sectionHeader}>User Submissions</Text>
      <Text style={styles.termsText}>
        When you submit information through Dibs, including:{'\n'}
        • issue reports{'\n'}
        • location suggestions{'\n'}
        • busyness updates{'\n'}
        • feedback{'\n\n'}
        we collect the information you voluntarily provide.
      </Text>

      <Text style={styles.sectionHeader}>Automatically Collected Information</Text>
      <Text style={styles.termsText}>
        Dibs may automatically collect limited technical information including:{'\n'}
        • device type{'\n'}
        • operating system{'\n'}
        • app version{'\n'}
        • crash reports{'\n'}
        • general analytics data{'\n'}
        • usage activity within the app{'\n\n'}
        This information helps improve app stability, performance, and user experience.
      </Text>

      <Text style={styles.sectionHeader}>How We Use Your Information</Text>
      <Text style={styles.termsText}>
        We use collected information to:{'\n'}
        • operate and maintain Dibs{'\n'}
        • display campus locations and busyness information{'\n'}
        • improve recommendations and map features{'\n'}
        • respond to support requests and issue reports{'\n'}
        • improve app performance and reliability{'\n'}
        • monitor abuse, spam, or misuse of the platform{'\n'}
        • comply with applicable legal obligations{'\n\n'}
        We do not sell your personal information to third parties.
      </Text>

      <Text style={styles.sectionHeader}>Favorites and Saved Data</Text>
      <Text style={styles.termsText}>
        Dibs allows users to favorite campus locations for easier access. Favorited locations are associated with your account and stored securely within our systems.
      </Text>

      <Text style={styles.sectionHeader}>Data Sharing</Text>
      <Text style={styles.termsText}>
        Dibs does not sell, rent, or trade personal information.{'\n\n'}
        We may share limited information with trusted third-party service providers that help operate our infrastructure, including:{'\n'}
        • authentication services{'\n'}
        • database hosting{'\n'}
        • analytics providers{'\n'}
        • cloud infrastructure providers{'\n\n'}
        These providers are only given access necessary to perform their services.
      </Text>

      <Text style={styles.sectionHeader}>Third-Party Services</Text>
      <Text style={styles.termsText}>
        Dibs may rely on third-party services and technologies including:{'\n'}
        • Supabase{'\n'}
        • Expo{'\n'}
        • Apple Maps / Google Maps integrations{'\n'}
        • analytics or crash reporting tools{'\n\n'}
        Your interactions with third-party services are governed by their own privacy policies.
      </Text>

      <Text style={styles.sectionHeader}>Data Security</Text>
      <Text style={styles.termsText}>
        We take reasonable measures to protect your information from unauthorized access, disclosure, or misuse. However, no electronic transmission or storage system can be guaranteed to be completely secure.
      </Text>

      <Text style={styles.sectionHeader}>Children&apos;s Privacy</Text>
      <Text style={styles.termsText}>
        Dibs is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.{'\n\n'}
        If you believe a child under 13 has provided personal information through Dibs, please contact us so we can remove the information.
      </Text>

      <Text style={styles.sectionHeader}>Your Choices</Text>
      <Text style={styles.termsText}>
        You may:{'\n'}
        • update certain account information{'\n'}
        • disable location permissions through device settings{'\n'}
        • request account deletion{'\n'}
        • stop using the app at any time{'\n\n'}
        Deleting your account may remove associated favorites, submissions, and saved preferences.
      </Text>

      <Text style={styles.sectionHeader}>Changes to This Privacy Policy</Text>
      <Text style={styles.termsText}>
        We may update this Privacy Policy from time to time. When changes are made, the “Last Updated” date will be revised accordingly.{'\n\n'}
        Continued use of Dibs after updates constitutes acceptance of the revised policy.
      </Text>

      <Text style={styles.sectionHeader}>Contact Us</Text>
      <Text style={[styles.termsText, styles.lastText]}>
        If you have questions or concerns regarding this Privacy Policy or your data, please contact:{'\n\n'}
        dibsadmin@gmail.com
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    textDecorationLine: 'underline',
    color: '#1a1a1a',
    marginTop: 22,
    marginBottom: 8
  },
  termsText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#444',
    lineHeight: 22
  },
  lastText: {
    paddingBottom: 28
  }
})