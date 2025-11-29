import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams(); // channel_id
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [otherUserName, setOtherUserName] = useState('Chat');

  useEffect(() => {
    fetchUserAndMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${id}`,
        },
        (payload) => {
          setMessages((current) => [payload.new as Message, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchUserAndMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Fetch channel details to get the other user's name
      const { data: channelData, error: channelError } = await supabase
        .from('chat_channels')
        .select(`
          client_id, 
          provider_id,
          client_profile:client_id(full_name), 
          provider_profile:provider_id(business_name, full_name)
        `)
        .eq('id', id)
        .single();

      if (!channelError && channelData) {
        if (user.id === channelData.client_id) {
           setOtherUserName(channelData.provider_profile?.business_name || channelData.provider_profile?.full_name || 'Proveedor');
        } else {
           setOtherUserName(channelData.client_profile?.full_name || 'Cliente');
        }
      }

      // Fetch existing messages
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', id)
        .order('created_at', { ascending: false }); // Newest first for FlatList inverted

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    const messageToSend = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          channel_id: id,
          sender_id: userId,
          content: messageToSend,
        });

      if (error) throw error;
      // The realtime subscription will add the message to the list
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
      setNewMessage(messageToSend); // Restore text on error
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === userId;
    return (
      <View style={[
        styles.messageContainer, 
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}>
        <Text style={[
          styles.messageText,
          isMyMessage ? styles.myMessageText : styles.theirMessageText
        ]}>{item.content}</Text>
        <Text style={styles.timeText}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{otherUserName}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ef4444" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted // Show newest at bottom
          contentContainerStyle={styles.listContent}
        />
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Escribe un mensaje..."
            multiline
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={!newMessage.trim()}>
            <Ionicons name="send" size={24} color={newMessage.trim() ? '#ef4444' : 'gray'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  listContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ef4444',
    borderBottomRightRadius: 2,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: 'white',
  },
  theirMessageText: {
    color: '#333',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
    color: 'rgba(0,0,0,0.5)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    padding: 5,
  },
});
