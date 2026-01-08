import { Ionicons } from '@expo/vector-icons';
import { HfInference } from "@huggingface/inference";
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView, StyleSheet, Text,
  TextInput,
  TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const HF_TOKEN = process.env.EXPO_PUBLIC_HF_TOKEN;
const hf = new HfInference(HF_TOKEN);

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState({ prenom: '', total_weight: 0, avatar_url: '' });

  // --- LOGIQUE MODAL CHAT ---
  const [isChatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const CLOTHES_RATIO = 0.4;
  const clothesEquivalent = Math.floor(userData.total_weight / CLOTHES_RATIO);

  // Mise à jour des données utilisateur au focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  // Charger l'historique spécifique à l'utilisateur à l'ouverture de la modal
  useEffect(() => {
    if (isChatVisible && userId) {
      loadChatHistory(userId);
    }
  }, [isChatVisible, userId]);

  const fetchUserData = async () => {
    try {
      const session = await SecureStore.getItemAsync('user_session');
      if (session) {
        const user = JSON.parse(session);
        setUserId(user.id.toString());
        const response = await fetch(`https://lemerovingien.fr/api_ikea_lsf/get_user_info.php?user_id=${user.id}`);
        const data = await response.json();
        if (data.success) setUserData(data);
      }
    } catch (error) {
      console.error("Erreur fetch user:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- PERSISTANCE CHAT ---
  const loadChatHistory = async (id: string) => {
    try {
      const savedChat = await SecureStore.getItemAsync(`chat_history_${id}`);
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      } else {
        setMessages([{ role: 'assistant', content: `Hej ${userData.prenom || 'Ami'} ! Je suis Sven. Prêt à recycler tes tissus IKEA avec Le Slip Français ?` }]);
      }
    } catch (e) {
      console.error("Erreur chargement chat:", e);
    }
  };

  const saveChatHistory = async (id: string, chatData: any) => {
    try {
      await SecureStore.setItemAsync(`chat_history_${id}`, JSON.stringify(chatData));
    } catch (e) {
      console.error("Erreur sauvegarde chat:", e);
    }
  };

  const handleSendChat = async () => {
    if (!inputText.trim() || !userId) return;

    const userMsg = inputText.trim();
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];

    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await hf.chatCompletion({
        model: "meta-llama/Llama-3.2-3B-Instruct",
        messages: [
          { role: "system", content: "Tu es Sven, l'expert upcycling pour IKEA x Le Slip Français. Tu es moderne, bref et pro. Réponds toujours en français." },
          ...newMessages
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const botText = response.choices[0].message.content || "Je n'ai pas compris...";
      const finalMessages = [...newMessages, { role: 'assistant' as const, content: botText }];

      setMessages(finalMessages);
      saveChatHistory(userId, finalMessages);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "Oups, Sven a une petite panne de courant. Réessaie !" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#144793" /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FDFDFD' }} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Bienvenue,</Text>
            <Text style={styles.name}>{userData.prenom || 'Ami'} !</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('../../assets/images/avatar.png')} style={styles.avatar} />
            </View>
          </TouchableOpacity>
        </View>

        {/* CARTE IMPACT */}
        <View style={styles.impactCard}>
          <View style={styles.fusionLine} />
          <Text style={styles.cardTitle}>MATIÈRE SAUVÉE</Text>
          <View style={styles.weightRow}>
            <Text style={styles.weightText}>{userData.total_weight}</Text>
            <Text style={styles.unitText}>KG</Text>
          </View>
          <Text style={styles.impactDesc}>
            Grâce à votre geste, <Text style={styles.boldBlue}>{clothesEquivalent} pièces</Text> ont été ré-assemblées par <Text style={styles.boldBlue}>Le Slip Français</Text>.
          </Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.btnBlue} onPress={() => router.push('/profile')}>
            <Ionicons name="qr-code" size={24} color="white" />
            <Text style={styles.btnTextWhite}>TON QR CODE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnYellow} onPress={() => router.push('/map')}>
            <Ionicons name="location" size={24} color="#144793" />
            <Text style={styles.btnTextBlue}>TROUVE TON MAGASIN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- LE BOUTON FLOTTANT SVEN AVEC BULLE CIRCULAIRE --- */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setChatVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.iconCircle}>
          <Image
            source={require('../../assets/images/lkf_chat.png')}
            style={styles.floatingImage}
          />
        </View>
      </TouchableOpacity>

      {/* --- MODAL DU CHATBOT --- */}
      <Modal visible={isChatVisible} animationType="slide" transparent={true} onRequestClose={() => setChatVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>SVEN ASSISTANT</Text>
                <View style={styles.titleUnderline} />
              </View>
              <TouchableOpacity onPress={() => setChatVisible(false)}>
                <Ionicons name="close-circle" size={32} color="#D80D1D" />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              style={styles.chatScroll}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg, index) => (
                <View key={index} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.botBubble]}>
                  <Text style={[styles.msgText, msg.role === 'user' ? styles.userText : styles.botText]}>
                    {msg.content}
                  </Text>
                </View>
              ))}
              {isTyping && <ActivityIndicator size="small" color="#144793" style={{ margin: 10, alignSelf: 'flex-start' }} />}
            </ScrollView>

            <View style={styles.inputArea}>
              <TextInput
                style={styles.input}
                placeholder="Pose ta question à Sven..."
                value={inputText}
                onChangeText={setInputText}
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.sendIcon} onPress={handleSendChat}>
                <Ionicons name="send" size={24} color="#144793" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFDFD', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 30 },
  welcome: { fontSize: 14, color: '#144793', fontWeight: '600', textTransform: 'uppercase' },
  name: { fontSize: 32, fontWeight: '900', color: '#D80D1D' },
  avatarContainer: { borderWidth: 3, borderColor: '#fdd20a', borderRadius: 35, padding: 3 },
  avatar: { width: 55, height: 55, borderRadius: 30 },
  impactCard: { backgroundColor: '#144793', borderRadius: 2, padding: 25, position: 'relative' },
  fusionLine: { position: 'absolute', top: 0, right: 0, width: 60, height: 60, borderRightWidth: 15, borderTopWidth: 15, borderColor: '#fdd20a' },
  cardTitle: { color: '#fdd20a', fontWeight: '900', fontSize: 18, letterSpacing: 2 },
  weightRow: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 10 },
  weightText: { fontSize: 70, fontWeight: '900', color: '#fff' },
  unitText: { fontSize: 24, fontWeight: '900', color: '#fdd20a', marginLeft: 10 },
  impactDesc: { color: '#fff', fontSize: 16, lineHeight: 24 },
  boldBlue: { color: '#fdd20a', fontWeight: '700' },
  actionGrid: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btnBlue: { flex: 1, backgroundColor: '#144793', padding: 20, alignItems: 'center' },
  btnYellow: { flex: 1, backgroundColor: '#fdd20a', padding: 20, alignItems: 'center' },
  btnTextWhite: { color: 'white', fontWeight: '900', marginTop: 10 },
  btnTextBlue: { color: '#144793', fontWeight: '900', marginTop: 10, textAlign: 'center' },

  // STYLES BOUTON FLOTTANT AVEC BULLE
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 99,
  },
  iconCircle: {
    width: 75,
    height: 75,
    backgroundColor: '#144793', // Fond Bleu IKEA
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fdd20a',     // Bordure Jaune IKEA
    elevation: 10,              // Ombre Android
    shadowColor: '#000',        // Ombre iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  floatingImage: {
    width: 55,
    height: 55,
    resizeMode: 'contain'
  },

  // STYLES MODAL CHAT
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { height: '85%', backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#144793' },
  titleUnderline: { width: 40, height: 6, backgroundColor: '#fdd20a', marginTop: 4 },
  chatScroll: { flex: 1 },
  bubble: { maxWidth: '85%', padding: 18, borderRadius: 25, marginVertical: 8 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#144793', borderBottomRightRadius: 0 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#F2F2F2', borderBottomLeftRadius: 0, borderLeftWidth: 6, borderLeftColor: '#fdd20a' },
  msgText: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  userText: { color: '#FFF' },
  botText: { color: '#144793' },
  inputArea: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#EEE', marginTop: 10 },
  input: { flex: 1, height: 50, backgroundColor: '#F5F5F5', borderRadius: 25, paddingHorizontal: 20, color: '#144793', fontWeight: '700' },
  sendIcon: { marginLeft: 15 }
});