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
  const [role, setRole] = useState('user'); // 'user' ou 'employee'
  const segments = useSegments();
  const router = useRouter();

  // 1. Vérifier la session et le RÔLE au démarrage
  useEffect(() => {
    const checkSession = async () => {
      const session = await SecureStore.getItemAsync('user_session');

      if (session) {
        const user = JSON.parse(session);
        setIsLogged(true);
        setRole(user.role || 'user'); // On récupère le rôle depuis la session

        // Si déjà connecté et sur la page login -> va à l'accueil
        if (segments[1] === 'explore2') {
          router.replace('/');
        }
      } else {
        setIsLogged(false);
        setRole('user');

        // Si pas connecté et pas sur la page login -> va au login
        if (segments[1] !== 'explore2') {
          router.replace('/explore2');
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, [segments]); // On vérifie à chaque changement de page

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
        // Masquer la barre si non connecté
        tabBarStyle: { display: isLogged ? 'flex' : 'none' },
      }}>

      {/* --- PAGES CLIENTS (Affichées si role === 'user') --- */}

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

      {/* --- PAGES EMPLOYÉS (Affichées si role === 'employee') --- */}

      <Tabs.Screen
        name="employee_scanner"
        options={{
          title: 'Scanner',
          // On force le type en 'any' ou on utilise une string brute pour éviter l'erreur de typage
          href: (isLogged && role === 'employee') ? ("/employee_scanner" as any) : null,
          tabBarIcon: ({ color }) => <Ionicons name="scan" size={24} color={color} />,
        }}
      />

      {/* --- PAGES CACHÉES (Login et Profil) --- */}

      <Tabs.Screen
        name="explore2"
        options={{
          title: 'Connexion',
          href: isLogged ? null : '/explore2', // Caché si connecté
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="lock.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Toujours caché de la barre d'onglets
        }}
      />

      {/* On garde explore si tu t'en sers encore, sinon mets href: null */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />

    </Tabs>
  );
}