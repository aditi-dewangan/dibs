import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, Pressable
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../lib/ThemeContext'

const TYPE_FILTERS = [
  { key: 'all', label: 'All Spots' },
  { key: 'study', label: '📚 Study' },
  { key: 'food', label: '🍔 Food' },
]

const ATTRIBUTE_FILTERS = [
  { key: 'wifi', label: 'WiFi' },
  { key: 'quiet', label: 'Quiet' },
  { key: 'open_late', label: 'Open Late' },
  { key: 'dining', label: 'Dining $' },
  { key: 'outdoor', label: 'Outdoor Seating' },
]

export default function FilterModal({
  visible,
  onClose,
  typeFilter,
  setTypeFilter,
  activeAttrs,
  toggleAttr,
  onClear
}) {
  const hasFilters = typeFilter !== 'all' || activeAttrs.length > 0
  const { primaryColor } = useTheme()

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Dim background */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Filter Spots</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color="#999" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Type */}
          <Text style={styles.sectionLabel}>Type</Text>
          <View style={styles.pillRow}>
            {TYPE_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.pill,
                  typeFilter === f.key && { backgroundColor: primaryColor }
                ]}
                onPress={() => setTypeFilter(f.key)}
              >
                <Text style={[styles.pillText, typeFilter === f.key && styles.pillTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Attributes */}
          <Text style={styles.sectionLabel}>Amenities</Text>
          <View style={styles.attrGrid}>
            {ATTRIBUTE_FILTERS.map((f) => {
              const active = activeAttrs.includes(f.key)
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    styles.attrPill,
                    active && {
                      borderColor: primaryColor,
                      backgroundColor: '#f0faf5'
                    }
                  ]}
                  onPress={() => toggleAttr(f.key)}
                >
                  {active && (
                    <Ionicons name="checkmark" size={13} color={primaryColor} style={{ marginRight: 4 }} />
                  )}
                  <Text
                    style={[
                      styles.attrText,
                      active && { color: primaryColor, fontWeight: '600' }
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {hasFilters && (
            <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.applyBtn, { backgroundColor: primaryColor }]} onPress={onClose}>
            <Text style={styles.applyText}>Show Results</Text>
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '75%'
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  }, 
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f2f2f2'
  },
  pillText: { fontSize: 14, color: '#666', fontWeight: '500' },
  pillTextActive: { color: '#fff' },
  attrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24
  },
  attrPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff'
  },
  attrText: { fontSize: 13, color: '#666' },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  clearBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center'
  },
  clearText: { color: '#666', fontWeight: '600', fontSize: 15 },
  applyBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  applyText: { color: '#fff', fontWeight: '600', fontSize: 15 }
})