import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const requests = [
  { id: '1', title: 'Boda en la playa', service: 'Decoración', status: 'pendiente', icon: 'flower-outline' },
  { id: '2', title: 'Cumpleaños Infantil', service: 'Catering', status: 'en progreso', icon: 'fast-food-outline' },
  { id: '3', title: 'Evento Corporativo', service: 'Música / DJ', status: 'finalizado', icon: 'musical-notes-outline' },
];

const filters = ['Todos', 'Bodas', 'Cumpleaños', 'Otros'];

const RequestCard = ({ request, router }: { request: { id: string; title: string; service: string; status: string; icon: any }, router: any }) => (
  <View style={styles.requestCard}>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{request.title}</Text>
      <View style={styles.serviceInfo}>
        <Ionicons name={request.icon} size={16} color="#ef4444" />
        <Text style={styles.serviceText}>{request.service}</Text>
      </View>
      <Text style={styles.statusText}>Estado: {request.status}</Text>
    </View>
    <TouchableOpacity style={styles.reviewButton} onPress={() => router.push(`/request-detail/${request.id}`)}>
      <Text style={styles.reviewButtonText}>Revisar</Text>
    </TouchableOpacity>
  </View>
);

export default function MyRequestsScreen() {
  const router = useRouter();

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
              style={[styles.pill, index === 0 ? styles.pillActive : styles.pillInactive]}
            >
              <Text style={index === 0 ? styles.pillTextActive : styles.pillTextInactive}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Request List */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {requests.map(req => <RequestCard key={req.id} request={req} router={router} />)}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
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
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: '#ef4444',
  },
  pillInactive: {
    backgroundColor: '#f3f4f6',
  },
  pillTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  pillTextInactive: {
    color: '#374151',
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  serviceText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#374151',
  },
  statusText: {
    fontSize: 12,
    color: 'gray',
  },
  reviewButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  reviewButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
