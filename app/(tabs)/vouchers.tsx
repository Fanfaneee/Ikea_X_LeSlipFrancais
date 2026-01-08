import HeroFooter from '@/components/HeroFooter';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface Voucher {
    id: number;
    code: string;
    description: string;
    is_used: number; // 0 ou 1
    created_at: string;
}

export default function VouchersScreen() {
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

    const renderVoucher = ({ item }: { item: Voucher }) => (
        <TouchableOpacity
            style={[styles.voucherCard, item.is_used === 1 && styles.usedVoucher]}
            onPress={() => item.is_used === 0 && setSelectedVoucher(item)}
            activeOpacity={0.8}
        >
            {/* Barre d'accentuation à gauche - Jaune si dispo, Rouge si utilisé */}
            <View style={[styles.leftAccent, { backgroundColor: item.is_used === 1 ? '#D80D1D' : '#fdd20a' }]} />

            <View style={styles.cardContent}>
                <View style={styles.textSection}>
                    <Text style={styles.codeLabel}>{item.code}</Text>
                    <Text style={styles.descText}>{item.description}</Text>
                </View>

                <Ionicons
                    name={item.is_used === 1 ? "checkmark-circle" : "qr-code-outline"}
                    size={28}
                    color={item.is_used === 1 ? "#D80D1D" : "#144793"}
                />
            </View>

            {item.is_used === 1 && (
                <View style={styles.usedBadge}>
                    <Text style={styles.usedText}>RECYCLÉ</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    if (loading) return (
        <View style={styles.centered}><ActivityIndicator size="large" color="#144793" /></View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* HEADER STYLE COLLISION */}
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>MES AVANTAGES</Text>
                    <View style={styles.titleUnderline} />
                </View>

                <FlatList
                    data={vouchers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderVoucher}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="shirt-outline" size={80} color="#EEE" />
                            <Text style={styles.empty}>Rien à assembler ?</Text>
                            <Text style={styles.emptySub}>Déposez vos tissus en magasin pour débloquer des bons d'achat IKEA x LSF.</Text>
                        </View>
                    }
                    ListFooterComponent={<HeroFooter />}
                />

                <Modal
                    visible={!!selectedVoucher}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setSelectedVoucher(null)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity style={styles.closeModal} onPress={() => setSelectedVoucher(null)}>
                                <Ionicons name="close-circle" size={35} color="#144793" />
                            </TouchableOpacity>

                            <Text style={styles.modalTitle}>{selectedVoucher?.description}</Text>

                            <View style={styles.qrWrapper}>
                                <QRCode
                                    value={selectedVoucher?.code || "N/A"}
                                    size={200}
                                    color="#144793"
                                    backgroundColor="white"
                                />
                            </View>

                            <Text style={styles.modalCode}>{selectedVoucher?.code}</Text>
                            <Text style={styles.modalInstruction}>À présenter lors de votre passage en caisse</Text>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, paddingHorizontal: 25 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginTop: 30, marginBottom: 20 },
    pageTitle: { fontSize: 32, fontWeight: '900', color: '#144793', letterSpacing: -1 },
    titleUnderline: { width: 60, height: 8, backgroundColor: '#D80D1D', marginTop: 5 },
    list: { paddingVertical: 10 },
    voucherCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center',
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#144793',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        borderBottomRightRadius: 0, // Style asymétrique
        height: 100,
    },
    usedVoucher: { opacity: 0.5, backgroundColor: '#FAFAFA' },
    leftAccent: { width: 10, height: '100%' },
    cardContent: { flex: 1, flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center' },
    textSection: { flex: 1 },
    codeLabel: { fontSize: 22, fontWeight: '900', color: '#144793', letterSpacing: 1 },
    descText: { fontSize: 14, color: '#666', fontWeight: '600', marginTop: 2 },
    usedBadge: {
        position: 'absolute', right: 0, top: 0,
        backgroundColor: '#D80D1D', paddingHorizontal: 12, paddingVertical: 4,
    },
    usedText: { color: 'white', fontSize: 10, fontWeight: '900' },
    emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
    empty: { fontSize: 20, fontWeight: '900', color: '#144793', marginTop: 20 },
    emptySub: { textAlign: 'center', color: '#999', marginTop: 10, lineHeight: 20, fontWeight: '500' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(20, 71, 147, 0.9)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', width: '85%', padding: 25, borderRadius: 30, alignItems: 'center', elevation: 20 },
    closeModal: { alignSelf: 'flex-end', marginBottom: -10 },
    modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginVertical: 20, color: '#144793' },
    qrWrapper: { padding: 15, backgroundColor: 'white', borderRadius: 20, borderWidth: 1, borderColor: '#EEE' },
    modalCode: { fontSize: 26, fontWeight: '900', color: '#144793', marginTop: 20, letterSpacing: 4 },
    modalInstruction: { marginTop: 15, color: '#666', textAlign: 'center', fontSize: 14, fontWeight: '600' }
});