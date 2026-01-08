import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* HEADER TITRE ÉPURÉ */}
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>MON PROFIL</Text>
                    <View style={styles.titleUnderline} />
                </View>

                {/* CARTE DE MEMBRE STYLE "COLLISION" */}
                <View style={styles.qrCard}>
                    {/* Angle jaune signature IKEA */}
                    <View style={styles.cornerAccent} />

                    <View style={styles.qrContainer}>
                        <QRCode
                            value={user.id.toString()}
                            size={width * 0.45}
                            color="#144793"
                            backgroundColor="white"
                        />
                    </View>

                    <View style={styles.idContainer}>
                        <Text style={styles.idLabel}>Présenter ce QR code lors du don de vos tissus</Text>
                    </View>

                    {/* Badge Rouge LSF asymétrique mais sobre */}
                    <View style={styles.brandBadge}>
                        <Text style={styles.brandBadgeText}>IKEA x Le Slip Français</Text>
                    </View>
                </View>

                {/* BLOC INFORMATIONS */}
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoBox}>
                            <Text style={styles.label}>NOM COMPLET</Text>
                            <Text style={styles.value}>{user.prenom} {user.nom}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={[styles.infoBox, { borderLeftColor: '#fdd20a' }]}>
                            <Text style={styles.label}>ADRESSE MAIL</Text>
                            <Text style={styles.valueSmall}>{user.email}</Text>
                        </View>
                    </View>
                </View>

                {/* BOUTON DÉCONNEXION */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>DÉCONNEXION </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        paddingHorizontal: 25,
    },
    header: {
        marginTop: 30,
        marginBottom: 20,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#144793',
        letterSpacing: -1,
    },
    titleUnderline: {
        width: 60,
        height: 8,
        backgroundColor: '#D80D1D',
        marginTop: 5,
    },
    qrCard: {
        backgroundColor: '#144793',
        borderRadius: 30,
        paddingVertical: 40,
        alignItems: 'center',
        marginTop: 20,
        borderBottomRightRadius: 0, // Style asymétrique moderne
        position: 'relative',
        overflow: 'hidden',
        // Shadow pour iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        // Elevation pour Android
        elevation: 12,
    },
    cornerAccent: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        borderTopWidth: 10,
        borderRightWidth: 10,
        borderColor: '#fdd20a',
    },
    qrContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 20,
    },
    idContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    idLabel: {
        color: '#fdd20a',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        textAlign: 'center',
    },
    idNumber: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '900',
    },
    brandBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: '#D80D1D',
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    brandBadgeText: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 12,
    },
    infoSection: {
        marginTop: 40,
        gap: 25,
    },
    infoRow: {
        flexDirection: 'row',
    },
    infoBox: {
        flex: 1,
        borderLeftWidth: 6,
        borderLeftColor: '#144793',
        paddingLeft: 15,
        paddingVertical: 5,
    },
    label: {
        color: '#D80D1D',
        fontWeight: '900',
        fontSize: 12,
        marginBottom: 2,
    },
    value: {
        fontSize: 24,
        fontWeight: '800',
        color: '#144793',
    },
    valueSmall: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    logoutBtn: {
        marginTop: 'auto',
        alignSelf: 'center',
        marginBottom: 30,
        padding: 10,
    },
    logoutText: {
        color: '#999',
        fontWeight: '800',
        fontSize: 12,
        letterSpacing: 1,
        textDecorationLine: 'underline',
    }
});