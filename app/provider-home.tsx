import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, FontAwesome, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
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

const navItems = [
  { name: 'Inicio', icon: 'home', active: true, route: '/provider-home' },
  { name: 'Solicitudes', icon: 'list', active: false, route: '/provider-requests' },
  { name: 'Perfil', icon: 'person', active: false, route: '/provider-profile' },
];

export default function ProviderHomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newRequests, setNewRequests] = useState<Request[]>([]);
  const [hasServices, setHasServices] = useState(true);

  const fetchProviderData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'Usuario no autenticado');
        router.replace('/login');
        return;
      }

      // 1. Get the categories this provider offers
      const { data: myServices, error: servicesError } = await supabase
        .from('services')
        .select('category_id')
        .eq('provider_id', user.id);

      if (servicesError) throw servicesError;

      // If provider hasn't registered any services, they shouldn't see requests
      if (!myServices || myServices.length === 0) {
          setHasServices(false);
          setNewRequests([]);
          return;
      }
      setHasServices(true);

      const myCategoryIds = myServices.map(s => s.category_id);

      // 2. Get quotes made by this provider to exclude them
      const { data: myQuotes, error: quotesError } = await supabase
        .from('quotes')
        .select('request_id')
        .eq('provider_id', user.id);

      if (quotesError) throw quotesError;

      const myQuoteRequestIds = myQuotes?.map(q => q.request_id) || [];

      // 3. Get OPEN requests that MATCH the provider's categories
      const { data: allRequests, error: requestsError } = await supabase
        .from('requests')
        .select(`
          id,
          title,
          event_date,
          status,
          category_id,
          service_categories (
            name,
            icon
          )
        `)
        .eq('status', 'open')
        .in('category_id', myCategoryIds) // FILTER: Match provider's categories
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      const newReqs: Request[] = [];

      allRequests?.forEach((req: any) => {
        if (!myQuoteRequestIds.includes(req.id)) {
          // New request (not quoted yet) AND matches category
          newReqs.push(req);
        }
      });

      setNewRequests(newReqs);

    } catch (error: any) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProviderData();
    }, [fetchProviderData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProviderData().then(() => setRefreshing(false));
  }, [fetchProviderData]);

  const getCategoryIcon = (categoryName: string) => {
    if (!categoryName) return { Lib: Ionicons, name: 'apps' };
    
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
    return { Lib: Ionicons, name: 'apps' };
  };

  const renderNewRequest = ({ item }: { item: Request }) => {
    const categoryName = item.service_categories?.name || '';
    const { Lib, name } = getCategoryIcon(categoryName);
    const categoryDisplayName = categoryName.toLowerCase() === 'floristeria' ? 'Floreria' : categoryName;
    
    return (
      <TouchableOpacity 
        style={styles.requestCard}
        onPress={() => router.push(`/request-detail/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: '#e0f2fe' }]}>
            <Lib name={name as any} size={24} color="#0284c7" />
          </View>
          <View style={styles.headerTextContainer}>
              <Text style={styles.requestTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.categoryText}>{categoryDisplayName}</Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={14} color="gray" />
              <Text style={styles.dateText}> {item.event_date}</Text>
          </View>
          <View style={styles.actionRow}>
              <Text style={styles.actionText}>Ver detalle</Text>
              <Ionicons name="arrow-forward" size={16} color="#ef4444" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nuevas Oportunidades</Text>
          <FontAwesome name="bell" size={24} color="#374151" />
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Solicitudes Disponibles</Text>
          <Text style={styles.subtitle}>Basado en los servicios que ofreces.</Text>
        </View>

        {!hasServices && !loading && (
            <View style={styles.warningCard}>
                <Ionicons name="alert-circle" size={24} color="#d97706" />
                <Text style={styles.warningText}>
                    No has registrado servicios. Configura tu perfil para ver solicitudes.
                </Text>
            </View>
        )}

        {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#ef4444" style={{marginTop: 50}} />
        ) : (
            <FlatList
                data={newRequests}
                renderItem={renderNewRequest}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            {hasServices 
                                ? "No hay solicitudes nuevas en tus categorías." 
                                : "Registra un servicio para empezar."}
                        </Text>
                    </View>
                }
            />
        )}

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
  welcomeSection: {
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  listContent: {
      paddingBottom: 100,
  },
  requestCard: {
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 15,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#f3f4f6',
  },
  cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
  },
  headerTextContainer: {
      marginLeft: 15,
      flex: 1,
  },
  iconContainer: {
      width: 45,
      height: 45,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
  },
  requestTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
  },
  categoryText: {
      fontSize: 13,
      color: '#6b7280',
  },
  cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 5,
  },
  dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  dateText: {
      fontSize: 12,
      color: 'gray',
  },
  actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  actionText: {
      color: '#ef4444',
      fontSize: 13,
      fontWeight: '600',
      marginRight: 5,
  },
  emptyState: {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
    marginTop: 20,
  },
  emptyStateText: {
    color: 'gray',
    marginTop: 0,
    fontSize: 14,
    textAlign: 'center',
  },
  warningCard: {
      flexDirection: 'row',
      backgroundColor: '#fffbeb',
      padding: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#fcd34d',
      marginBottom: 20,
      alignItems: 'center',
  },
  warningText: {
      color: '#b45309',
      marginLeft: 10,
      flex: 1,
      fontSize: 13,
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