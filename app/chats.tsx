import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

interface ChatChannel {
  id: string;
  request_id: string;
  client_id: string;
  provider_id: string;
  created_at: string;
  requests: {
    title: string;
  };
  client_profile: {
    full_name: string;
    avatar_url: string | null;
  };
  provider_profile: {
    business_name: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export default function ChatsScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchChats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setUserId(user.id);
      setUserRole(user.user_metadata?.role || 'client');

      // Build query
      let query = supabase
        .from('chat_channels')
        .select(`
          *,
          requests (title),
          client_profile:client_id (full_name, avatar_url),
          provider_profile:provider_id (business_name, full_name, avatar_url)
        `)
        .or(`client_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      // Apply filter if requestId exists
      if (requestId) {
        query = query.eq('request_id', requestId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setChannels(data as any);
    } catch (error: any) {
      console.error('Error fetching chats:', error);
      if (error.message?.includes('row-level security') || error.code === '42501') {
         Alert.alert('Error de Permisos', 'No se pueden cargar los chats. Por favor ejecuta el script de políticas SQL en Supabase.');
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: ChatChannel }) => {
    const isClient = userId === item.client_id;
    
    // Determine the "Other" person's display name
    const otherName = isClient 
      ? (item.provider_profile?.business_name || item.provider_profile?.full_name || 'Proveedor')
      : (item.client_profile?.full_name || 'Cliente');

    const initials = otherName.substring(0, 2).toUpperCase();

    return (
      <TouchableOpacity 
        style={styles.chatItem} 
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{otherName}</Text>
          <Text style={styles.chatContext}>{item.requests?.title || 'Sin asunto'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  const clientNavItems = [
    { name: 'Inicio', icon: 'home', active: false, route: '/home' },
    { name: 'Mis Solicitudes', icon: 'calendar', active: false, route: '/my-requests' },
    { name: 'Chats', icon: 'chatbubble-ellipses', active: true, route: '/chats' },
    { name: 'Perfil', icon: 'person', active: false, route: '/client-profile' },
  ];

  const providerNavItems = [
    { name: 'Inicio', icon: 'home', active: false, route: '/provider-home' },
    { name: 'Solicitudes', icon: 'list', active: false, route: '/provider-requests' },
    { name: 'Chats', icon: 'chatbubble-ellipses', active: true, route: '/chats' }, 
    { name: 'Perfil', icon: 'person', active: false, route: '/provider-profile' },
  ];

  const navItems = userRole === 'provider' ? providerNavItems : clientNavItems;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* No back button, this is a tab screen */}
        <Text style={styles.headerTitle}>Mis Chats</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#ef4444" style={styles.loader} />
      ) : (
        <FlatList
          data={channels}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={50} color="gray" />
              <Text style={styles.emptyText}>
                {requestId 
                  ? "No hay chats para esta solicitud." 
                  : "No tienes conversaciones activas."}
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.navBar}>
        {navItems.map((item) => (
          <TouchableOpacity key={item.name} style={styles.navItem} onPress={() => item.route && router.push(item.route)}>
            <Ionicons
              name={item.icon as any}
              size={26}
              color={item.active ? '#ef4444' : 'gray'}
            />
            <Text style={[styles.navText, item.active && styles.navTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loader: {
    marginTop: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for nav bar
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 18,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  chatContext: {
    fontSize: 13,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 15,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  navTextActive: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
});
