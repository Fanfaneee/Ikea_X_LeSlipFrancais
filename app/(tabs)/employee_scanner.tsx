import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EmployeeScanner() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [clientId, setClientId] = useState('');
    const [weight, setWeight] = useState('');
    const router = useRouter();

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>Nous avons besoin de la caméra pour scanner</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}><Text>Autoriser</Text></TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = ({ data }: any) => {
        setScanned(true);
        setClientId(data); // L'ID du client est dans le QR
    };

    const submitDeposit = async () => {
        if (!weight) {
            Alert.alert("Erreur", "Veuillez entrer un poids.");
            return;
        }

        try {
            // REMPLACE BIEN "TON_DOMAINE" PAR TON VRAI DOMAINE YUNOHOST ICI
            const response = await fetch('https://lemerovingien.fr/api_ikea_lsf/validate_deposit.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // On passe en JSON
                body: JSON.stringify({
                    user_id: clientId,
                    weight: weight
                })
            });

            const res = await response.json();

            if (res.success) {
                Alert.alert("Succès", `Dépôt de ${weight}kg validé !`);
                setScanned(false);
                setWeight('');
                setClientId('');
            } else {
                Alert.alert("Erreur", res.message || "Erreur serveur");
            }
        } catch (e) {
            Alert.alert("Erreur", "Connexion serveur échouée. Vérifiez votre URL HTTPS.");
        }
    };

    return (
        <View style={styles.container}>
            {!scanned ? (
                <CameraView
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                    style={StyleSheet.absoluteFillObject}
                />
            ) : (
                <View style={styles.form}>
                    <Text style={styles.label}>Client ID : {clientId}</Text>
                    <TextInput
                        placeholder="Poids du tissu (kg)"
                        keyboardType="numeric"
                        style={styles.input}
                        value={weight}
                        onChangeText={setWeight}
                    />
                    <TouchableOpacity style={styles.submit} onPress={submitDeposit}>
                        <Text style={styles.btnText}>Valider le dépôt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setScanned(false)} style={styles.cancel}>
                        <Text>Annuler / Scanner à nouveau</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
    form: { backgroundColor: 'white', margin: 20, padding: 30, borderRadius: 20, alignItems: 'center' },
    label: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    input: { borderBottomWidth: 1, width: '100%', padding: 10, fontSize: 20, marginBottom: 30 },
    submit: { backgroundColor: '#0058a3', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    cancel: { marginTop: 20 },
    button: { padding: 20, backgroundColor: '#ffdb00', marginTop: 20 }
});