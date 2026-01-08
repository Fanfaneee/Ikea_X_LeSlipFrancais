import HeroFooter from '@/components/HeroFooter';
import React from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const NEWS_DATA = [
    {
        id: '1',
        title: "LE KALSONGER FRANÇAIS",
        excerpt: "On nous a appris que pour créer, il fallait extraire. Que pour porter du neuf, il fallait produire du neuf. Chez IKEA et Le Slip Français, nous pensons que le futur de la mode dort déjà dans vos armoires. Nous transformons le décor de votre quotidien en l'objet le plus intime : votre sous-vêtement.",
        date: "IL Y A 15 JOURS",
        image: "https://images.unsplash.com/photo-1626477357166-ed26f0e3f1cc?q=80&w=870&auto=format&fit=crop",

    },
    {
        id: '2',
        title: "LA MODE N'A PAS BESOIN DE NAÎTRE DANS UN CHAMP.",
        excerpt: "La production d'un seul t-shirt en coton neuf consomme 2 700 litres d'eau. En choisissant l'upcycling, vous court-circuitez ce cycle. On ne plante rien, on ne traite rien, on ne gaspille rien. Votre rideau IKEA est prêt pour 10 ans de plus sur vous.",
        date: "HIER",
        image: "https://images.unsplash.com/photo-1637964034233-b9b1d3619535?q=80&w=387&auto=format&fit=crop",
        category: "IMPACT"
    },
    {
        id: '3',
        title: "PORTEZ CE QUE PERSONNE D'AUTRE N'AURA.",
        excerpt: "La fast-fashion produit des millions de copies identiques. Le Kalsonger Français fait l'inverse. Puisque chaque tissu collecté a son histoire, chaque vêtement produit est une pièce unique au monde. Soyez l'unique propriétaire d'une mode qui ne ressemble qu'à vous.",
        date: "IL Y A 2 JOURS",
        image: "https://images.unsplash.com/photo-1517466121016-3f7e7107c756?q=80&w=870&auto=format&fit=crop",
        category: "STYLE"
    },
];

export default function NewsScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>ACTUALITÉS</Text>
                    <View style={styles.titleUnderline} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {NEWS_DATA.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.9}>
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: item.image }} style={styles.cardImage} />

                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.cardDate}>{item.date}</Text>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardExcerpt}>{item.excerpt}</Text>

                                <View style={styles.footerRow}>
                                    <View style={styles.fusionAccent} />
                                    <Text style={styles.readMore}>EN SAVOIR PLUS</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                    <HeroFooter />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, paddingHorizontal: 25 },
    scrollContent: { paddingVertical: 10 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 30,
        marginBottom: 30,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#144793',
        shadowOpacity: 0.15,
        shadowRadius: 15,
        borderBottomRightRadius: 0 // Asymétrie Collision
    },
    imageContainer: { position: 'relative' },
    cardImage: { width: '100%', height: 220 },
    categoryBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: '#D80D1D',
        paddingHorizontal: 15,
        paddingVertical: 8
    },
    categoryText: { color: '#FFF', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
    cardBody: { padding: 25 },
    cardDate: { fontSize: 12, fontWeight: '800', color: '#fdd20a', marginBottom: 8, letterSpacing: 1 },
    cardTitle: { fontSize: 22, fontWeight: '900', color: '#144793', marginBottom: 12, lineHeight: 26 },
    cardExcerpt: { fontSize: 15, color: '#666', lineHeight: 22, fontWeight: '500' },
    footerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    fusionAccent: { width: 30, height: 4, backgroundColor: '#144793', marginRight: 10 },
    readMore: { fontSize: 12, fontWeight: '900', color: '#144793', letterSpacing: 1 },
    header: { marginTop: 30, marginBottom: 20 },
    pageTitle: { fontSize: 32, fontWeight: '900', color: '#144793', letterSpacing: -1 },
    titleUnderline: { width: 60, height: 8, backgroundColor: '#D80D1D', marginTop: 5 },
});