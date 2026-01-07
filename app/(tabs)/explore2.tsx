import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    /*     const API_URL = "http://10.21.181.153/api_ikea_lsf/auth.php";
     */
    const API_URL = "https://lemerovingien.fr/api_ikea_lsf/auth.php";
    const handleAuth = async () => {
        if (!form.email || !form.password) {
            Alert.alert("Erreur", "Email et mot de passe requis.");
            return;
        }

        setLoading(true);
        const action = isLogin ? 'login' : 'register';

        try {
            const response = await fetch(`${API_URL}?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const res = await response.json();

            if (res.success) {
                if (isLogin) {
                    await SecureStore.setItemAsync('user_session', JSON.stringify(res.user));

                    router.replace('/profile'); // Redirection vers le profil
                } else {
                    Alert.alert("Succès", "Compte créé !");
                    setIsLogin(true);
                }
            } else {
                Alert.alert("Erreur", res.message);
            }
        } catch (error) {
            Alert.alert("Erreur", "Connexion au serveur impossible.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <ThemedText type="title">{isLogin ? 'Connexion ' : 'Inscription'}</ThemedText>

                {!isLogin && (
                    <>
                        <TextInput placeholder="Nom" style={styles.input} onChangeText={(t) => setForm({ ...form, nom: t })} />
                        <TextInput placeholder="Prénom" style={styles.input} onChangeText={(t) => setForm({ ...form, prenom: t })} />
                    </>
                )}

                <TextInput placeholder="Email" autoCapitalize="none" style={styles.input} onChangeText={(t) => setForm({ ...form, email: t })} />
                <TextInput placeholder="Mot de passe" secureTextEntry style={styles.input} onChangeText={(t) => setForm({ ...form, password: t })} />

                {loading ? <ActivityIndicator size="large" color="#0058a3" /> : (
                    <>
                        <TouchableOpacity style={styles.button} onPress={handleAuth}>
                            <ThemedText style={styles.buttonText}>{isLogin ? 'Se connecter' : 'Créer mon compte'}</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                            <ThemedText style={styles.link}>
                                {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                            </ThemedText>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', padding: 20, gap: 10 },
    input: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginBottom: 5, color: '#000' },
    button: { backgroundColor: '#0058a3', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    link: { textAlign: 'center', marginTop: 15, color: '#0058a3' }
});