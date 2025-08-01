import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import COLORS from '../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StaffTabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        headerTitleStyle: {
          color: COLORS.textPrimary,
          fontWeight: '600',
        },
        headerShadowVisible: false,

        tabBarStyle: {
          backgroundColor: COLORS.cardBackground,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingTop: 5,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
      }}
    > 
      <Tabs.Screen
        name='index'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='person-outline' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='etapas'
        options={{
          title: 'Etapas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='layers-outline' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='posts'
        options={{
          title: 'Posts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='document-text-outline' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='ver-posts'
        options={{
          title: 'Ver Posts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='eye-outline' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="edit-post"
        options={{
          href: null, // evita que se muestre en la barra de navegación
        }}
      />
    </Tabs>
  )
}
