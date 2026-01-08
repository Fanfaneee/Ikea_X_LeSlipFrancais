import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useRef, useState } from 'react';
import { Alert, Animated, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker, Region } from 'react-native-maps';
const ALL_IKEA_FRANCE = [
    { id: '1', name: "IKEA Paris Rivoli", latitude: 48.8605, longitude: 2.3426, address: "144 Rue de Rivoli, 75001 Paris", hours: "10:00 - 20:00" },
    { id: '2', name: "IKEA Paris Italie 2", latitude: 48.8300, longitude: 2.3550, address: "30 Av. d'Italie, 75013 Paris", hours: "10:00 - 20:00" },
    { id: '3', name: "IKEA Villiers-sur-Marne", latitude: 48.8280, longitude: 2.5301, address: "35 Rue Jean Jaurès, 94350 Villiers-sur-Marne", hours: "10:00 - 20:00" },
    { id: '4', name: "IKEA Roissy Nord", latitude: 48.9743, longitude: 2.4953, address: "306 Rue de la Belle Étoile, 95700 Roissy", hours: "10:00 - 20:00" },
    { id: '5', name: "IKEA Franconville", latitude: 48.9867, longitude: 2.2148, address: "337 Rue du Général Leclerc, 95130 Franconville", hours: "10:00 - 20:00" },
    { id: '6', name: "IKEA Thiais", latitude: 48.7593, longitude: 2.3853, address: "3 Rue de la Résistance, 94320 Thiais", hours: "10:00 - 20:00" },
    { id: '7', name: "IKEA Vélizy", latitude: 48.7840, longitude: 2.2220, address: "3 Rue du Petit Clamart, 78140 Vélizy-Villacoublay", hours: "10:00 - 21:00" },
    { id: '8', name: "IKEA Plaisir", latitude: 48.8140, longitude: 1.9540, address: "117 Av. de l'Arbre à la Quat' de Plaisir, 78370 Plaisir", hours: "10:00 - 20:00" },
    { id: '9', name: "IKEA Evry (Lisses)", latitude: 48.5965, longitude: 2.4392, address: "1 Rue du Clos aux Pois, 91090 Lisses", hours: "10:00 - 20:00" },
    { id: '10', name: "IKEA Lille (Lomme)", latitude: 50.6410, longitude: 2.9780, address: "1 Rue du Grand But, 59160 Lille", hours: "10:00 - 20:00" },
    { id: '11', name: "IKEA Hénin-Beaumont", latitude: 50.4130, longitude: 2.9640, address: "Boulevard Olof Palme, 62110 Hénin-Beaumont", hours: "10:00 - 20:00" },
    { id: '12', name: "IKEA Reims", latitude: 49.2240, longitude: 3.9570, address: "ZAC Croix Blandin, 51100 Reims", hours: "10:00 - 20:00" },
    { id: '13', name: "IKEA Metz", latitude: 49.0660, longitude: 6.2420, address: "Rue du Bois d'Orly, 57685 Augny", hours: "10:00 - 20:00" },
    { id: '14', name: "IKEA Strasbourg", latitude: 48.6010, longitude: 7.7280, address: "Place de l'Abattoir, 67000 Strasbourg", hours: "10:00 - 20:00" },
    { id: '15', name: "IKEA Mulhouse", latitude: 47.7780, longitude: 7.2720, address: "Parc des Collines, 68790 Morschwiller-le-Bas", hours: "10:00 - 20:00" },
    { id: '16', name: "IKEA Rouen", latitude: 49.3400, longitude: 1.1070, address: "ZAC de la Carbonnière, 76410 Tourville-la-Rivière", hours: "10:00 - 20:00" },
    { id: '17', name: "IKEA Caen (Fleury)", latitude: 49.1460, longitude: -0.3470, address: "Avenue de Suisse, 14123 Fleury-sur-Orne", hours: "10:00 - 20:00" },
    { id: '18', name: "IKEA Rennes (Pacé)", latitude: 48.1460, longitude: -1.7760, address: "ZAC de la Giraudais, 35740 Pacé", hours: "10:00 - 20:00" },
    { id: '19', name: "IKEA Brest", latitude: 48.4280, longitude: -4.4140, address: "ZAC de l'Hermitage, 29200 Brest", hours: "10:00 - 20:00" },
    { id: '20', name: "IKEA Nantes (St-Herblain)", latitude: 47.2270, longitude: -1.6370, address: "Pôle Atlantis, 44800 Saint-Herblain", hours: "10:00 - 20:00" },
    { id: '21', name: "IKEA Tours", latitude: 47.3780, longitude: 0.7250, address: "Avenue du Grand S, 37000 Tours", hours: "10:00 - 20:00" },
    { id: '22', name: "IKEA Bordeaux Lac", latitude: 44.8817, longitude: -0.5677, address: "Avenue des 4 Ponts, 33300 Bordeaux", hours: "10:00 - 20:00" },
    { id: '23', name: "IKEA Bayonne", latitude: 43.4960, longitude: -1.4390, address: "Centre Commercial Ametzondo, 64100 Bayonne", hours: "10:00 - 20:00" },
    { id: '24', name: "IKEA Toulouse (Roques)", latitude: 43.5110, longitude: 1.3740, address: "Allée de Fraixinet, 31120 Roques", hours: "10:00 - 20:00" },
    { id: '25', name: "IKEA Lyon Grand Parilly", latitude: 45.7198, longitude: 4.8850, address: "6 Rue Simone Veil, 69200 Vénissieux", hours: "10:00 - 21:00" },
    { id: '26', name: "IKEA St-Etienne", latitude: 45.4486, longitude: 4.4156, address: "Rue de la Montat, 42000 Saint-Étienne", hours: "10:00 - 20:00" },
    { id: '27', name: "IKEA Grenoble", latitude: 45.1830, longitude: 5.7660, address: "ZAC de Centralp, 38360 Saint-Égrève", hours: "10:00 - 20:00" },
    { id: '28', name: "IKEA Clermont-Ferrand", latitude: 45.8030, longitude: 3.1510, address: "ZAC des Gravanches, 63100 Clermont-Ferrand", hours: "10:00 - 20:00" },
    { id: '29', name: "IKEA Dijon", latitude: 47.3390, longitude: 5.0740, address: "Parc Commercial de la Toison d'Or, 21000 Dijon", hours: "10:00 - 20:00" },
    { id: '30', name: "IKEA Orléans (Ardon)", latitude: 47.8170, longitude: 1.9160, address: "ZAC de la Porte d'Orléans, 45160 Ardon", hours: "10:00 - 20:00" },
    { id: '31', name: "IKEA Montpellier", latitude: 43.6020, longitude: 3.9240, address: "Place de Troie, 34000 Montpellier", hours: "10:00 - 20:00" },
    { id: '32', name: "IKEA Avignon", latitude: 43.9250, longitude: 4.8980, address: "ZAC de la Courtine, 84000 Avignon", hours: "10:00 - 20:00" },
    { id: '33', name: "IKEA Marseille Vitrolles", latitude: 43.4340, longitude: 5.2530, address: "Quartier du Griffon, 13127 Vitrolles", hours: "10:00 - 20:00" },
    { id: '34', name: "IKEA Marseille La Valentine", latitude: 43.2920, longitude: 5.4850, address: "Avenue de Saint-Menet, 13011 Marseille", hours: "10:00 - 20:00" },
    { id: '35', name: "IKEA Toulon (La Valette)", latitude: 43.1410, longitude: 6.0070, address: "Avenue de l'Université, 83160 La Valette-du-Var", hours: "10:00 - 20:00" },
    { id: '36', name: "IKEA Nice", latitude: 43.7080, longitude: 7.2020, address: "Boulevard du Mercantour, 06200 Nice", hours: "10:00 - 20:00" },
];

export default function MapScreen() {
    const mapRef = useRef<MapView>(null);
    const searchRef = useRef<any>(null);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const slideAnim = useRef(new Animated.Value(400)).current;

    const navigateToUserLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Accès refusé", "La localisation est nécessaire pour vous situer.");
            return;
        }
        let location = await Location.getCurrentPositionAsync({});
        mapRef.current?.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }, 1000);
    };

    const openInMaps = (lat: number, lng: number, label: string) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        if (url) Linking.openURL(url);
    };
    const handleSearchSelect = (details: any) => {
        if (!details) return;
        const { lat, lng } = details.geometry.location;
        mapRef.current?.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        }, 1000);
        setSelectedStore(null);
    };

    const onMarkerPress = (store: any) => {
        setSelectedStore(store);
        mapRef.current?.animateToRegion({
            latitude: store.latitude - 0.06,
            longitude: store.longitude,
            latitudeDelta: 0.25,
            longitudeDelta: 0.25,
        }, 600);

        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
        }).start();
    };

    const closePanel = () => {
        Animated.timing(slideAnim, {
            toValue: 400,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setSelectedStore(null));
    };

    const handleRegionChange = (region: Region) => {
        if (region.latitudeDelta > 15) {
            mapRef.current?.animateToRegion({
                latitude: 46.2276,
                longitude: 2.2137,
                latitudeDelta: 12,
                longitudeDelta: 12,
            }, 500);
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider="google"
                style={styles.map}
                initialRegion={{
                    latitude: 46.2276,
                    longitude: 2.2137,
                    latitudeDelta: 10,
                    longitudeDelta: 10,
                }}
                showsUserLocation={true}       // Garde le point bleu
                showsMyLocationButton={false}  // SUPPRIME le bouton natif moche
                onRegionChangeComplete={handleRegionChange}
                onPress={closePanel}
            >
                {ALL_IKEA_FRANCE.map((store) => (
                    <Marker
                        key={store.id}
                        coordinate={{ latitude: store.latitude, longitude: store.longitude }}
                        onPress={() => onMarkerPress(store)}
                    >
                        <View style={styles.ikeaPin}>
                            <Ionicons name="cart" size={14} color="white" />
                        </View>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.searchContainer}>
                <GooglePlacesAutocomplete
                    ref={searchRef}
                    placeholder='Chercher une ville...'
                    fetchDetails={true}
                    onPress={(data, details = null) => handleSearchSelect(details)}
                    renderRightButton={() => (
                        <TouchableOpacity style={styles.clearButton} onPress={() => { searchRef.current?.setAddressText(''); setSelectedStore(null); }}>
                            <Ionicons name="close-circle" size={22} color="#888" />
                        </TouchableOpacity>
                    )}
                    query={{ key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY, language: 'fr', components: 'country:fr' }}
                    styles={{ container: { flex: 0 }, textInput: styles.searchBar }}
                    enablePoweredByContainer={false}
                />
            </View>

            <TouchableOpacity style={styles.myLocationButton} onPress={navigateToUserLocation}>
                <Ionicons name="locate" size={26} color="#0058a3" />
            </TouchableOpacity>

            {selectedStore && (
                <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.handle} />
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.storeTitle}>{selectedStore.name}</Text>
                            <Text style={styles.statusText}>Ouvert • Ferme à 20:00</Text>
                        </View>
                        <TouchableOpacity onPress={closePanel}>
                            <Ionicons name="close-circle" size={30} color="#ccc" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <Ionicons name="location" size={20} color="#0058a3" />
                            <Text style={styles.infoText}>{selectedStore.address}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="time" size={20} color="#0058a3" />
                            <Text style={styles.infoText}>Horaires : {selectedStore.hours}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.directionsButton}
                        onPress={() => openInMaps(selectedStore.latitude, selectedStore.longitude, selectedStore.name)}
                    >
                        <Ionicons name="navigate" size={20} color="white" />
                        <Text style={styles.directionsText}>C'est parti !</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    map: { width: '100%', height: '100%' },
    ikeaPin: { backgroundColor: '#0058a3', padding: 6, borderRadius: 20, borderWidth: 2, borderColor: '#ffdb00', elevation: 5 },
    searchContainer: { position: 'absolute', width: '92%', alignSelf: 'center', top: 60, zIndex: 10 },
    searchBar: { height: 50, borderRadius: 12, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, fontSize: 16 },
    clearButton: { position: 'absolute', right: 12, top: 12 },
    myLocationButton: {
        position: 'absolute',
        bottom: 120,
        right: 20,
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 35,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 5,
        zIndex: 5,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 25,
        left: 15,
        right: 15,
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 25,
        zIndex: 15,
    },
    handle: { width: 45, height: 6, backgroundColor: '#eee', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    storeTitle: { fontSize: 22, fontWeight: 'bold', color: '#0058a3' },
    statusText: { color: '#2e7d32', fontWeight: 'bold', marginTop: 2 },
    infoSection: { marginVertical: 20 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    infoText: { marginLeft: 12, color: '#444', fontSize: 15, flex: 1 },
    directionsButton: {
        backgroundColor: '#0058a3',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 15,
    },
    directionsText: { color: 'white', fontWeight: 'bold', marginLeft: 10, fontSize: 17 },
});