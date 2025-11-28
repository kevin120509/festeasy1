import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

const RequestCard = ({ request, router }: { request: Request; router: any }) => (
  <View style={styles.requestCard}>
    <Text style={[styles.cardTitle, {color: '#ef4444'}]}>
      {request.title}
    </Text>
    {/* Services section */}
    <View style={styles.servicesContainer}>
      <View style={styles.serviceItem}>
        <Ionicons 
          name={(request.service_categories?.icon as any) || 'apps-outline'} 
          size={18} 
          color="#ef4444" 
        />
        <Text style={styles.serviceTextNew}>
          {request.service_categories?.name || 'Servicio General'}
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
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
            <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {filteredRequests.length > 0 ? (
                filteredRequests.map(req => <RequestCard key={req.id} request={req} router={router} />)
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No tienes solicitudes {activeFilter !== 'Todos' ? 'en esta categoría' : ''}.</Text>
                </View>
            )}
            </ScrollView>
        )}
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
  }
});
