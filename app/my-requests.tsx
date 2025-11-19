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
    <Text style={[styles.cardTitle, {color: '#ef4444'}]}>Categoría: {request.service}</Text>
    {/* Services section */}
    <View style={styles.servicesContainer}>
      <View style={styles.serviceItem}>
        <Ionicons name={request.icon} size={18} color="#ef4444" />
        <Text style={styles.serviceTextNew}>{request.service}</Text>
      </View>
    </View>

    {/* Footer of the Card */}
    <View style={styles.cardFooter}>
      <Text style={styles.statusText}>Estado: {request.status}</Text>
      <TouchableOpacity style={styles.reviewButton} onPress={() => router.push(`/request-detail/${request.id}`)}>
        <Text style={styles.reviewButtonText}>Revisar</Text>
      </TouchableOpacity>
    </View>
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
    paddingHorizontal: 16,
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
  },
  pillTextInactive: {
    color: 'black',
    fontWeight: '500',
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
});
