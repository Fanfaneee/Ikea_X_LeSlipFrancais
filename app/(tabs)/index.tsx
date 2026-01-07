import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ prenom: '', total_weight: 0, avatar_url: '' });

  // --- LOGIQUE DE CALCUL ---
  const CLOTHES_RATIO = 0.4;
  const clothesEquivalent = Math.floor(userData.total_weight / CLOTHES_RATIO);

  // Mise à jour automatique quand l'écran revient au premier plan
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const session = await SecureStore.getItemAsync('user_session');
      if (session) {
        const user = JSON.parse(session);

        // Appel à ton serveur YunoHost
        const response = await fetch(`https://lemerovingien.fr/api_ikea_lsf/get_user_info.php?user_id=${user.id}`);
        const data = await response.json();

        if (data.success) {
          setUserData(data);
        }
      }
    } catch (error) {
      console.error("Erreur fetch données utilisateur:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0058a3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER : Prénom + Avatar cliquable */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Content de vous revoir,</Text>
          <Text style={styles.name}>{userData.prenom || 'Ami'} !</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image
            source={{ uri: userData.avatar_url || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* CARD IMPACT ÉCOLOGIQUE */}
      <View style={styles.impactCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="leaf" size={24} color="#2e7d32" />
          <Text style={styles.cardTitle}>Votre compteur écolo</Text>
        </View>

        <Text style={styles.weightText}>{userData.total_weight} kg</Text>
        <Text style={styles.subText}>de tissus recyclés à ce jour</Text>

        <View style={styles.divider} />

        <Text style={styles.impactDesc}>
          C'est l'équivalent de <Text style={styles.bold}>{clothesEquivalent} vêtements</Text> fabriqués par <Text style={styles.lsf}>Le Slip Français</Text> grâce à vos dons.
        </Text>
      </View>

      {/* BOUTON ACTIONS */}
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/profile')}>
          <Ionicons name="qr-code" size={30} color="white" />
          <Text style={styles.buttonText}>Mon QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ffdb00' }]} onPress={() => router.push('/map')}>
          <Ionicons name="map" size={30} color="#0058a3" />
          <Text style={[styles.buttonText, { color: '#0058a3' }]}>Trouver un bac</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: 30 },
  welcome: { fontSize: 16, color: '#666' },
  name: { fontSize: 26, fontWeight: 'bold', color: '#0058a3' },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#0058a3' },
  impactCard: { backgroundColor: '#f0f7ff', borderRadius: 25, padding: 25, borderLeftWidth: 8, borderLeftColor: '#0058a3', elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  weightText: { fontSize: 45, fontWeight: '900', color: '#0058a3' },
  subText: { fontSize: 16, color: '#666', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#d0e3ff', marginVertical: 15 },
  impactDesc: { fontSize: 15, lineHeight: 22, color: '#444' },
  bold: { fontWeight: 'bold', color: '#2e7d32' },
  lsf: { fontWeight: 'bold', textDecorationLine: 'underline' },
  actionGrid: { flexDirection: 'row', gap: 15, marginTop: 25 },
  actionButton: { flex: 1, backgroundColor: '#0058a3', padding: 20, borderRadius: 20, alignItems: 'center', gap: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' }
});