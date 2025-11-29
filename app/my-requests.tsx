import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

// Define interface for the request data
interface Request {
  id: string;
  title: string;
  status: string;
  created_at: string;
  service_categories: {
    name: string;
    icon: string;
  } | null;
}

const filters = ['Todos', 'Pendientes', 'Confirmados', 'Finalizados'];

const getCategoryIcon = (categoryName: string) => {
  if (!categoryName) return { Lib: Ionicons, name: 'apps-outline' };
  
  // Normalize: lowercase and remove accents
  const normalized = categoryName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  if (normalized.includes('floreria') || normalized.includes('floristeria')) {
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

const RequestCard = ({ request, router }: { request: Request; router: any }) => {
  const { Lib, name } = getCategoryIcon(request.service_categories?.name || '');
  const displayName = request.service_categories?.name?.toLowerCase() === 'floristeria' ? 'Floreria' : (request.service_categories?.name || 'Servicio General');

  return (
    <View style={styles.requestCard}>
      <Text style={[styles.cardTitle, {color: '#ef4444'}]}>
        {request.title}
      </Text>
      {/* Services section */}
      <View style={styles.servicesContainer}>
        <View style={styles.serviceItem}>
          <Lib 
            name={name as any} 
            size={18} 
            color="#ef4444" 
          />
          <Text style={styles.serviceTextNew}>
            {displayName}
          </Text>
        </View>
      </View>

      {/* Footer of the Card */}
      <View style={styles.cardFooter}>
        <Text style={styles.statusText}>
          Estado: <Text style={{fontWeight: 'bold', textTransform: 'capitalize'}}>{request.status}</Text>
        </Text>
        <TouchableOpacity style={styles.reviewButton} onPress={() => router.push(`/request-detail/${request.id}`)}>
          <Text style={styles.reviewButtonText}>Revisar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function MyRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Todos');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para ver tus solicitudes.');
        router.replace('/login');
        return;
      }

      const { data, error } = await supabase
        .from('requests')
        .select(`
          id,
          title,
          status,
          created_at,
          service_categories (
            name,
            icon
          )
        `)
        .eq('client_id', user.id)
        .neq('status', 'cancelled') // Exclude cancelled requests
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRequests(data as unknown as Request[]);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (activeFilter === 'Todos') return true;
    // Simple status mapping for demo purposes
    if (activeFilter === 'Pendientes') return req.status === 'open' || req.status === 'quoted';
    if (activeFilter === 'Confirmados') return req.status === 'hired';
    if (activeFilter === 'Finalizados') return req.status === 'completed'; // 'cancelled' is now excluded at fetch level
    return true;
  });

  const renderNavItem = (item: { name: string; icon: any; active: boolean; route: string }) => (
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
  );

  const navItems = [
    { name: 'Inicio', icon: 'home', active: false, route: '/home' },
    { name: 'Mis Solicitudes', icon: 'calendar', active: true, route: '/my-requests' },
    { name: 'Chats', icon: 'chatbubble-ellipses', active: false, route: '/chats' },
    { name: 'Perfil', icon: 'person', active: false, route: '/client-profile' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.header}>
          {/* Removed back button to act as a main tab screen */}
          <View></View>
        </View>
        <Text style={styles.title}>Mis Solicitudes</Text>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {filters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.pill, activeFilter === filter ? styles.pillActive : styles.pillInactive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={activeFilter === filter ? styles.pillTextActive : styles.pillTextInactive}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Request List */}
        {loading ? (
            <ActivityIndicator size="large" color="#ef4444" style={{marginTop: 50}} />
        ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.list} contentContainerStyle={{paddingBottom: 80}}>
            {filteredRequests.length > 0 ? (
                filteredRequests.map(req => <RequestCard key={req.id} request={req} router={router} />)
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No tienes solicitudes {activeFilter !== 'Todos' ? 'en esta categoría' : ''}.</Text>
                </View>
            )}
            </ScrollView>
        )}

        <View style={styles.navBar}>
          {navItems.map(renderNavItem)}
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
  card: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    height: 28, // Keep height placeholder
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: '#ef4444',
  },
  pillInactive: {
    backgroundColor: '#e5e7eb',
  },
  pillTextActive: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  pillTextInactive: {
    color: 'black',
    fontWeight: '500',
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 20,
    marginBottom: 15,
  },
  servicesContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  serviceTextNew: { // New style for service text
    marginLeft: 10,
    fontSize: 15,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    color: 'gray',
    fontWeight: '500',
  },
  reviewButton: {
    backgroundColor: '#ef4444',
    borderRadius: 25, // More rounded for pill shape
    paddingVertical: 8,
    paddingHorizontal: 15, // Comfortable horizontal padding
  },
  reviewButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
      alignItems: 'center',
      marginTop: 50,
  },
  emptyStateText: {
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
