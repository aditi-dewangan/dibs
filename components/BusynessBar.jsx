import { View, Text, StyleSheet } from 'react-native'
import {
  BUSYNESS_COLOR_LOW,
  BUSYNESS_COLOR_MEDIUM,
  BUSYNESS_COLOR_HIGH
} from '../components/config'


function getSegmentColor(position, score) {
  if (position > score) return '#f0f0f0'
  if (position <= 3) return BUSYNESS_COLOR_LOW
  if (position <= 7) return BUSYNESS_COLOR_MEDIUM
  return BUSYNESS_COLOR_HIGH
}

function getLabel(label) {
  switch (label) {
    case 'not_busy': return 'Not busy'
    case 'somewhat_busy': return 'Somewhat busy'
    case 'very_busy': return 'Very busy'
    default: return 'No data or Closed'
  }
}

export default function BusynessBar({ score, label }) {
  return (
    <View>
      <View style={styles.bar}>
        {Array.from({ length: 10 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              { backgroundColor: getSegmentColor(i + 1, score) }
            ]}
          />
        ))}
      </View>
      <Text style={styles.label}>{getLabel(label)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 5
  },
  segment: {
    flex: 1,
    height: 10,
    borderRadius: 4
  },
  label: {
    fontSize: 11,
    color: '#aaa'
  }
})