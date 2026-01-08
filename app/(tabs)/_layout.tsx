import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  const [role, setRole] = useState('user');
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await SecureStore.getItemAsync('user_session');

      // Sécurité pour les segments : on vérifie le nom de la route actuelle
      const currentRoute = segments[segments.length - 1];

      if (session) {
        const user = JSON.parse(session);
        setIsLogged(true);
        setRole(user.role || 'user');

        if (currentRoute === 'explore2') {
          router.replace('/');
        }
      } else {
        setIsLogged(false);
        setRole('user');

        if (currentRoute !== 'explore2') {
          router.replace('/explore2');
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, [segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0058a3" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { display: isLogged ? 'flex' : 'none' },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          href: (isLogged && role === 'user') ? '/' : null,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />



      <Tabs.Screen
        name="map"
        options={{
          title: 'Magasins',
          href: (isLogged && role === 'user') ? '/map' : null,
          tabBarIcon: ({ color }) => <Ionicons size={24} name="map" color={color} />,
        }}
      />

      <Tabs.Screen
        name="vouchers"
        options={{
          title: 'Avantages',
          href: (isLogged && role === 'user') ? '/vouchers' : null,
          tabBarIcon: ({ color }) => <Ionicons size={24} name="gift" color={color} />,
        }}
      />

      <Tabs.Screen
        name="employee_scanner"
        options={{
          title: 'Scanner',
          href: (isLogged && role === 'employee') ? ("/employee_scanner" as any) : null,
          tabBarIcon: ({ color }) => <Ionicons name="scan" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore2"
        options={{
          title: 'Connexion',
          href: isLogged ? null : '/explore2',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="lock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'Actualités',
          href: (isLogged && role === 'user') ? '/news' : null,
          tabBarIcon: ({ color }) => <Ionicons size={24} name="newspaper" color={color} />,
        }}
      />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}