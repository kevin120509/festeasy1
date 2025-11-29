import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

// Interfaces
interface Request {
  id: string;
  title: string;
  event_date: string;
  status: string;
  service_categories: {
    name: string;
    icon: string;
  } | null;
}

interface QuotedRequest extends Request {
  quote_status: string;
  quote_price: number;
  quote_id: string;
}

const navItems = [
  { name: 'Inicio', icon: 'home', active: false, route: '/provider-home' },
  { name: 'Solicitudes', icon: 'list', active: true, route: '/provider-requests' },
  { name: 'Chats', icon: 'chatbubble-ellipses', active: false, route: '/chats' },
  { name: 'Perfil', icon: 'person', active: false, route: '/provider-profile' },
];

export default function ProviderRequestsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quotedRequests, setQuotedRequests] = useState<QuotedRequest[]>([]);

  const fetchQuotedRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'Usuario no autenticado');
        router.replace('/login');
        return;
      }

      // 1. Get all quotes made by this provider
      const { data: myQuotes, error: quotesError } = await supabase
        .from('quotes')
        .select('request_id, id, status, proposed_price')
        .eq('provider_id', user.id);

      if (quotesError) throw quotesError;

      if (!myQuotes || myQuotes.length === 0) {
          setQuotedRequests([]);
          return;
      }

      const myQuoteRequestIds = myQuotes.map(q => q.request_id);
      const myQuotesMap = new Map(myQuotes.map(q => [q.request_id, q]));

      // 2. Get request details for these quotes
      const { data: requests, error: requestsError } = await supabase
        .from('requests')
        .select(`
          id,
          title,
          event_date,
          status,
          service_categories (
            name,
            icon
          )
        `)
        .in('id', myQuoteRequestIds)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      const quotedReqs: QuotedRequest[] = [];

      requests?.forEach((req: any) => {
          const quote = myQuotesMap.get(req.id);
          quotedReqs.push({
            ...req,
            quote_status: quote?.status,
            quote_price: quote?.proposed_price,
            quote_id: quote?.id,
          });
      });

      setQuotedRequests(quotedReqs);

    } catch (error: any) {
      console.error('Error fetching quoted requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchQuotedRequests();
    }, [fetchQuotedRequests])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchQuotedRequests().then(() => setRefreshing(false));
  }, [fetchQuotedRequests]);

  const getCategoryIcon = (categoryName: string) => {
    if (!categoryName) return { Lib: Ionicons, name: 'apps-outline' };
    
    // Normalize: lowercase and remove accents
    const normalized = categoryName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    if (normalized.includes('floreria') || normalized.includes('floristería')) {
      return { Lib: Ionicons, name: 'flower' };
    }
    if (normalized.includes('pasteleria') || normalized.includes('postres') || normalized.includes('pastel')) {
      return { Lib: MaterialCommunityIcons, name: 'cupcake' };
    }
    if (normalized.includes('iluminacion') || normalized.includes('luces')) {
      return { Lib: MaterialCommunityIcons, name: 'lightbulb-on' };
    }
    if (normalized.includes('decoracion') || normalized.includes('globos')) {
      return { Lib: MaterialCommunityIcons, name: 'balloon' };
    }
    if (normalized.includes('catering') || normalized.includes('comida') || normalized.includes('alimentos')) {
      return { Lib: MaterialCommunityIcons, name: 'silverware-fork-knife' };
    }
    if (normalized.includes('musica') || normalized.includes('dj') || normalized.includes('sonido')) {
      return { Lib: Ionicons, name: 'musical-notes' };
    }
    if (normalized.includes('foto') || normalized.includes('video')) {
      return { Lib: Ionicons, name: 'camera' };
    }
    if (normalized.includes('mobiliario') || normalized.includes('sillas') || normalized.includes('mesas')) {
      return { Lib: MaterialCommunityIcons, name: 'table-chair' };
    }
    if (normalized.includes('montaje') || normalized.includes('carpas')) {
      return { Lib: MaterialCommunityIcons, name: 'hammer-wrench' };
    }
    if (normalized.includes('animacion') || normalized.includes('entretenimiento')) {
      return { Lib: FontAwesome, name: 'magic' };
    }
    if (normalized.includes('bebidas') || normalized.includes('barra')) {
      return { Lib: MaterialCommunityIcons, name: 'glass-cocktail' };
    }
    
    // Default
    return { Lib: Ionicons, name: 'apps-outline' };
  };

  const renderQuotedRequest = ({ item }: { item: QuotedRequest }) => {
    const { Lib, name } = getCategoryIcon(item.service_categories?.name || '');
    const displayName = item.service_categories?.name?.toLowerCase() === 'floristeria' ? 'Floreria' : item.service_categories?.name;
    
    return (
      <TouchableOpacity 
        style={styles.quotedCard}
        onPress={() => router.push(`/proposal-detail/${item.quote_id}`)}
      >
        <View style={styles.quotedRow}>
          <View style={styles.quotedInfo}>
              <Text style={styles.quotedTitle}>{item.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Lib name={name as any} size={14} color="#6b7280" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 12, color: '#6b7280' }}>{displayName}</Text>
              </View>
              <Text style={styles.quotedSubtitle}>
                  Cotizado: <Text style={{fontWeight: 'bold'}}>${item.quote_price}</Text>
              </Text>
          </View>
          <View style={[styles.statusBadge, item.quote_status === 'accepted' ? styles.statusAccepted : styles.statusPending]}>
              <Text style={[styles.statusText, item.quote_status === 'accepted' ? styles.statusTextAccepted : styles.statusTextPending]}>
                  {item.quote_status === 'accepted' ? 'Aceptada' : 'Pendiente'}
              </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Cotizaciones</Text>
          <FontAwesome name="list-alt" size={24} color="#374151" />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#ef4444" style={{marginVertical: 20}} />
            ) : quotedRequests.length > 0 ? (
                quotedRequests.map(req => <View key={req.id}>{renderQuotedRequest({item: req})}</View>)
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>Aún no has enviado cotizaciones.</Text>
                </View>
            )}
        </ScrollView>

        <View style={styles.navBar}>
          {navItems.map((item) => (
            <TouchableOpacity key={item.name} style={styles.navItem} onPress={() => item.route && router.push(item.route)}>
              <Ionicons
                name={item.icon}
                size={26}
                color={item.active ? '#ef4444' : 'gray'}
              />
              <Text style={[styles.navText, item.active && styles.navTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  quotedCard: {
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
  },
  quotedRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  quotedInfo: {
      flex: 1,
  },
  quotedTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
  },
  quotedSubtitle: {
      fontSize: 13,
      color: '#6b7280',
  },
  statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
  },
  statusPending: {
      backgroundColor: '#fff7ed',
  },
  statusAccepted: {
      backgroundColor: '#dcfce7',
  },
  statusText: {
      fontSize: 12,
      fontWeight: 'bold',
  },
  statusTextPending: {
      color: '#c2410c',
  },
  statusTextAccepted: {
      color: '#15803d',
  },
  emptyState: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
    marginTop: 50,
  },
  emptyStateText: {
    color: 'gray',
    marginTop: 0,
    fontSize: 14,
    textAlign: 'center',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20, 
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
