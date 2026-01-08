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
    is_used: number;
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

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerText}>
                <Text style={styles.pageTitle}>MES AVANTAGES</Text>
                <View style={styles.titleUnderline} />
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>BARÈME DE COLLECTE IKEA x LSF</Text>
                <Text style={styles.infoSub}>Récompense par dépôt effectué :</Text>

                <View style={styles.rulesContainer}>
                    <View style={styles.ruleItem}>
                        <Ionicons name="leaf" size={18} color="#fdd20a" />
                        <Text style={styles.ruleText}>0,5kg - 2,5kg : <Text style={styles.bold}>-5% sur le 2ème art.</Text></Text>
                    </View>
                    <View style={styles.ruleItem}>
                        <Ionicons name="leaf" size={18} color="#fdd20a" />
                        <Text style={styles.ruleText}>2,5kg - 5kg : <Text style={styles.bold}>-10% sur le 2ème art.</Text></Text>
                    </View>
                    <View style={styles.ruleItem}>
                        <Ionicons name="leaf" size={18} color="#fdd20a" />
                        <Text style={styles.ruleText}>Dès 5kg : <Text style={styles.bold}>-5% sur tout le panier</Text></Text>
                    </View>
                </View>
            </View>
            <Text style={styles.sectionTitle}>MES BONS D'ACHAT</Text>
        </View>
    );

    const renderVoucher = ({ item }: { item: Voucher }) => (
        <TouchableOpacity
            style={[styles.voucherCard, item.is_used === 1 && styles.usedVoucher]}
            onPress={() => item.is_used === 0 && setSelectedVoucher(item)}
            activeOpacity={0.8}
        >
            <View style={[styles.leftAccent, { backgroundColor: item.is_used === 1 ? '#D80D1D' : '#fdd20a' }]} />
            <View style={styles.cardContent}>
                <View style={styles.textSection}>
                    <Text style={styles.codeLabel}>{item.code}</Text>
                    <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
                </View>
                <Ionicons
                    name={item.is_used === 1 ? "checkmark-circle" : "qr-code-outline"}
                    size={28}
                    color={item.is_used === 1 ? "#D80D1D" : "#144793"}
                />
            </View>
        </TouchableOpacity>
    );

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#144793" /></View>;

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                data={vouchers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderVoucher}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={<HeroFooter />}
            />

            <Modal visible={!!selectedVoucher} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeModal} onPress={() => setSelectedVoucher(null)}>
                            <Ionicons name="close-circle" size={35} color="#144793" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{selectedVoucher?.description}</Text>
                        <View style={styles.qrWrapper}>
                            <QRCode value={selectedVoucher?.code || "N/A"} size={180} color="#144793" />
                        </View>
                        <Text style={styles.modalCode}>{selectedVoucher?.code}</Text>
                        <Text style={styles.modalInstruction}>À scanner en caisse IKEA</Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FDFDFD' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { paddingHorizontal: 25, paddingTop: 20 },
    headerText: { marginBottom: 20 },
    pageTitle: { fontSize: 32, fontWeight: '900', color: '#144793' },
    titleUnderline: { width: 60, height: 8, backgroundColor: '#D80D1D', marginTop: 5 },
    infoCard: { backgroundColor: '#144793', borderRadius: 20, padding: 20, marginBottom: 30 },
    infoTitle: { color: '#fdd20a', fontWeight: '900', fontSize: 13 },
    infoSub: { color: '#FFF', fontSize: 13, marginBottom: 15, opacity: 0.8 },
    rulesContainer: { gap: 10 },
    ruleItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    ruleText: { color: '#FFF', fontSize: 14 },
    bold: { fontWeight: '900', color: '#fdd20a' },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: '#144793', marginBottom: 15, paddingHorizontal: 25 },
    list: { paddingBottom: 20 },
    voucherCard: {
        backgroundColor: 'white', borderRadius: 20, flexDirection: 'row',
        marginHorizontal: 25, marginBottom: 15, alignItems: 'center',
        overflow: 'hidden', elevation: 4, height: 95
    },
    usedVoucher: { opacity: 0.6 },
    leftAccent: { width: 8, height: '100%' },
    cardContent: { flex: 1, flexDirection: 'row', paddingHorizontal: 15, alignItems: 'center' },
    textSection: { flex: 1 },
    codeLabel: { fontSize: 18, fontWeight: '900', color: '#144793' },
    descText: { fontSize: 13, color: '#666', fontWeight: '600', marginTop: 3 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(20, 71, 147, 0.9)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', width: '85%', padding: 25, borderRadius: 30, alignItems: 'center' },
    closeModal: { alignSelf: 'flex-end' },
    modalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginVertical: 15, color: '#144793' },
    qrWrapper: { padding: 10, backgroundColor: 'white', borderRadius: 15, borderWidth: 1, borderColor: '#EEE' },
    modalCode: { fontSize: 24, fontWeight: '900', color: '#144793', marginTop: 15, letterSpacing: 3 },
    modalInstruction: { marginTop: 10, color: '#666', fontSize: 12, fontWeight: '600' }
});