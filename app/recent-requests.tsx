import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RecentRequestsScreen() {
  const router = useRouter();

  const requests = [
    {
      id: 1,
      category: 'Catering',
      description: 'Necesito un servicio de catering para una fiesta de cumpleaños...',
      date: '25 de Octubre, 2024 - 7:00 PM',
      location: 'Av. Siempreviva 742, Springfield',
      guests: '50 personas',
      status: 'Pendiente'
    },
    {
      id: 2,
      category: 'Música',
      description: 'Busco banda de rock para evento corporativo.',
      date: '15 de Noviembre, 2024 - 8:00 PM',
      location: 'Hotel Plaza, Centro',
      guests: '200 personas',
      status: 'Cotizando'
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Solicitudes Recientes</Text>
        <View style={styles.content}>
          {requests.map((req) => (
            <TouchableOpacity
              key={req.id}
              style={styles.requestItem}
              onPress={() => router.push({
                pathname: '/request-detail',
                params: req
              })}
            >
              <View>
                <Text style={styles.requestCategory}>{req.category}</Text>
                <Text style={styles.requestDate}>{req.date}</Text>
                <Text numberOfLines={1} style={styles.requestDesc}>{req.description}</Text>
                <View style={styles.reviewButton}>
                  <Text style={styles.reviewButtonText}>Revisar</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
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
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  header: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  requestCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  requestDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  requestDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    maxWidth: 250,
  },
  reviewButton: {
    marginTop: 10,
    backgroundColor: '#E53935',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
