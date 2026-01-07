import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// 1. DÉFINITION DU TYPE (Pour enlever l'erreur 'never')
interface Voucher {
    id: number;
    code: string;
    description: string;
    is_used: number; // 0 ou 1
    created_at: string;
}

export default function VouchersScreen() {
    // 2. TYPAGE DU STATE
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetchVouchers();
        }, [])
    );

    const fetchVouchers = async () => {
        try {
            const session = await SecureStore.getItemAsync('user_session');
            if (session) {
                const user = JSON.parse(session);
                // Vérifie bien ton IP ici
                const response = await fetch(`https://lemerovingien.fr/api_ikea_lsf/get_vouchers.php?user_id=${user.id}`);
                const data = await response.json();
                if (data.success) {
                    setVouchers(data.vouchers);
                }
            }
        } catch (error) {
            console.error("Erreur Vouchers:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. TYPAGE DE L'ITEM DANS LE RENDER
    const renderVoucher = ({ item }: { item: Voucher }) => (
        <TouchableOpacity
            style={[styles.voucherCard, item.is_used === 1 && styles.usedVoucher]}
            onPress={() => item.is_used === 0 && setSelectedVoucher(item)}
            activeOpacity={0.7}
        >
            <View style={styles.leftSection}>
                <Ionicons
                    name={item.is_used === 1 ? "checkmark-circle" : "gift"}
                    size={32}
                    color={item.is_used === 1 ? "#999" : "#0058a3"}
                />
            </View>

            <View style={styles.rightSection}>
                <Text style={styles.codeLabel}>{item.code}</Text>
                <Text style={styles.descText}>{item.description}</Text>
                {item.is_used === 0 && (
                    <Text style={styles.tapHint}>
                        <Ionicons name="qr-code-outline" size={12} /> Appuyer pour scanner
                    </Text>
                )}
            </View>

            {item.is_used === 1 && (
                <View style={styles.usedBadge}>
                    <Text style={styles.usedText}>UTILISÉ</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    if (loading) return (
        <View style={styles.centered}><ActivityIndicator size="large" color="#0058a3" /></View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mes Avantages</Text>
                <Text style={styles.subtitle}>Retrouvez vos récompenses IKEA x LSF</Text>
            </View>

            <FlatList
                data={vouchers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderVoucher}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="shirt-outline" size={80} color="#ccc" />
                        <Text style={styles.empty}>Pas encore d'avantages ?</Text>
                        <Text style={styles.emptySub}>Ramenez vos tissus en magasin pour débloquer des réductions !</Text>
                    </View>
                }
            />

            <Modal
                visible={!!selectedVoucher}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSelectedVoucher(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeModal}
                            onPress={() => setSelectedVoucher(null)}
                        >
                            <Ionicons name="close-circle" size={35} color="#333" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>{selectedVoucher?.description}</Text>

                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={selectedVoucher?.code || "N/A"}
                                size={220}
                                color="#0058a3"
                                backgroundColor="white"
                            />
                        </View>

                        <Text style={styles.modalCode}>{selectedVoucher?.code}</Text>
                        <Text style={styles.modalInstruction}>À présenter lors de votre passage en caisse IKEA</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 25, backgroundColor: '#0058a3', paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
    subtitle: { color: '#d0e3ff', marginTop: 5, fontSize: 15 },
    list: { padding: 20 },
    voucherCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        flexDirection: 'row',
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        overflow: 'hidden'
    },
    usedVoucher: { opacity: 0.6, backgroundColor: '#f0f0f0' },
    leftSection: { paddingRight: 20, borderRightWidth: 1, borderRightColor: '#eee' },
    rightSection: { paddingLeft: 20, flex: 1 },
    codeLabel: { fontSize: 20, fontWeight: '800', color: '#0058a3', letterSpacing: 1 },
    descText: { fontSize: 15, color: '#333', marginTop: 4, fontWeight: '500' },
    tapHint: { fontSize: 12, color: '#0058a3', marginTop: 10, fontWeight: '600' },
    usedBadge: {
        position: 'absolute', right: -25, top: 12,
        backgroundColor: '#666', paddingHorizontal: 35, paddingVertical: 5, transform: [{ rotate: '45deg' }]
    },
    usedText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    empty: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 20 },
    emptySub: { textAlign: 'center', color: '#999', paddingHorizontal: 40, marginTop: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', width: '85%', padding: 25, borderRadius: 30, alignItems: 'center' },
    closeModal: { alignSelf: 'flex-end' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#0058a3' },
    qrWrapper: { padding: 15, backgroundColor: 'white', borderRadius: 20, borderWidth: 1, borderColor: '#eee' },
    modalCode: { fontSize: 24, fontWeight: '900', color: '#333', marginTop: 20, letterSpacing: 3 },
    modalInstruction: { marginTop: 15, color: '#666', textAlign: 'center', fontSize: 14 }
});