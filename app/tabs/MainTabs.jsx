import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import ExploreScreen from './ExploreScreen'
import FavoritesScreen from './FavoritesScreen'
import ProfileScreen from './ProfileScreen'
import { useTheme } from '../../lib/ThemeContext'

const Tab = createBottomTabNavigator()

export default function MainTabs() {
  const { primaryColor } = useTheme()

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
          tabBarStyle: {
            backgroundColor: primaryColor,
            borderTopWidth: 0,
            paddingBottom: 8,
            paddingTop: 6,
            height: 60
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600'
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName
            if (route.name === 'Explore') {
              iconName = focused ? 'compass' : 'compass-outline'
            } else if (route.name === 'Favorites') {
              iconName = focused ? 'heart' : 'heart-outline'
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline'
            }
            return <Ionicons name={iconName} size={size} color={color} />
          },
        })}
      >
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}