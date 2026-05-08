import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import ExploreScreen from './ExploreScreen'
import FavoritesScreen from './FavoritesScreen'
import ProfileScreen from './ProfileScreen'
import { useTheme } from '../../lib/ThemeContext'
import { View, StatusBar } from 'react-native'


const Tab = createBottomTabNavigator()

export default function MainTabs() {
  const { primaryColor } = useTheme()

  return (
    <View style={{ flex: 1, backgroundColor: primaryColor }}>
      <StatusBar
        style="dark"
        backgroundColor={primaryColor}
      />
      
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
            tabBarStyle: {
              backgroundColor: primaryColor,
              // position the tab bar absolutely so it sits flush at the bottom
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              paddingBottom: 4,
              paddingTop: 10,
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
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
                return (
                  <View style={{ marginBottom: -4 }}>
                    <Ionicons name={iconName} size={size} color={color} />
                  </View>
                )
            },
          })}
        >
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  </View>
  )
}