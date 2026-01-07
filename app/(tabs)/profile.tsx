import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg'; // Import du QR Code

export default function ProfileScreen() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                const session = await SecureStore.getItemAsync('user_session');
                if (session) {
                    setUser(JSON.parse(session));
                }
            };
            loadData();
        }, [])
    );

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('user_session');
        router.replace('/explore2');
    };

    if (!user) return null;

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>Ma Carte Fidélité</ThemedText>

            {/* SECTION QR CODE */}
            <View style={styles.qrSection}>
                <View style={styles.qrContainer}>
                    <QRCode
                        value={user.id.toString()} // Le QR contient l'ID
                        size={180}
                        color="#0058a3"
                        backgroundColor="white"
                    />
                </View>
                <ThemedText style={styles.qrHint}>Présentez ce code lors de votre dépôt en magasin</ThemedText>
            </View>

            {/* INFOS USER */}
            <View style={styles.card}>
                <ThemedText style={styles.label}>Utilisateur : <ThemedText type="defaultSemiBold">{user.prenom} {user.nom}</ThemedText></ThemedText>
                <ThemedText style={styles.label}>ID Compte : <ThemedText type="defaultSemiBold">#{user.id}</ThemedText></ThemedText>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Se déconnecter</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    title: { marginBottom: 30, color: '#0058a3' },
    qrSection: { alignItems: 'center', marginBottom: 30 },
    qrContainer: {
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    qrHint: { marginTop: 15, fontSize: 14, color: '#666', textAlign: 'center' },
    card: { backgroundColor: '#f9f9f9', padding: 20, borderRadius: 15, width: '100%', marginBottom: 20 },
    label: { fontSize: 16, marginBottom: 5, color: '#333' },
    logoutButton: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' }
});