import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function RequestDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Dummy data fallback if params are missing (for development/preview)
  const requestData = {
    category: params.category || 'Catering',
    description: params.description || 'Necesito un servicio de catering para una fiesta de cumpleaños con temática de los 80. Preferiblemente comida mexicana.',
    date: params.date || '25 de Octubre, 2024 - 7:00 PM',
    location: params.location || 'Av. Siempreviva 742, Springfield',
    guests: params.guests || '50 personas',
  };

  const proposals = [
    {
      id: 1,
      name: 'Banquetes La Fiesta',
      rating: 4.8,
      reviews: 120,
      price: '$2,500.00',
    },
    {
      id: 2,
      name: 'TacoMania Eventos',
      rating: 4.2,
      reviews: 85,
      price: '$2,200.00',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de la Solicitud</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Request Info Card */}
          <View style={styles.card}>
            <Text style={styles.categoryTitle}>Categoría: {requestData.category}</Text>
            <Text style={styles.descriptionText}>{requestData.description}</Text>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#A55353" style={styles.icon} />
              <View>
                <Text style={styles.infoLabel}>Fecha y Hora</Text>
                <Text style={styles.infoValue}>{requestData.date}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#A55353" style={styles.icon} />
              <View>
                <Text style={styles.infoLabel}>Ubicación</Text>
                <Text style={styles.infoValue}>{requestData.location}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color="#A55353" style={styles.icon} />
              <View>
                <Text style={styles.infoLabel}>Invitados</Text>
                <Text style={styles.infoValue}>{requestData.guests}</Text>
              </View>
            </View>
          </View>

          {/* Proposals Section */}
          <Text style={styles.sectionTitle}>Propuestas Recibidas</Text>

          {proposals.map((proposal) => (
            <View key={proposal.id} style={styles.proposalCard}>
              <Text style={styles.providerName}>{proposal.name}</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesome5
                    key={star}
                    name={star <= Math.round(proposal.rating) ? "star" : "star"}
                    solid={star <= Math.round(proposal.rating)}
                    size={14}
                    color="#FFD700"
                    style={{ marginRight: 2 }}
                  />
                ))}
                <Text style={styles.ratingText}>{proposal.rating} ({proposal.reviews} reseñas)</Text>
              </View>

              <Text style={styles.proposalPrice}>Propuesta: <Text style={styles.priceValue}>{proposal.price}</Text></Text>

              <View style={styles.proposalActions}>
                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={() => router.push('/proposal-detail/catering-delicias-prop-1')}
                >
                  <Text style={styles.outlineButtonText}>Ver propuesta</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filledButton}>
                  <Text style={styles.filledButtonText}>Elegir proveedor</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButtonOutline}>
            <Text style={styles.footerButtonOutlineText}>Editar solicitud</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.footerButtonOutline, styles.cancelButton]}>
            <Text style={styles.cancelButtonText}>Cancelar solicitud</Text>
          </TouchableOpacity>
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
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  descriptionText: {
    fontSize: 14,
    color: '#8E5A5A',
    lineHeight: 20,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#A55353',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  proposalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  proposalPrice: {
    fontSize: 14,
    marginBottom: 15,
    color: '#000',
  },
  priceValue: {
    color: '#A55353',
    fontWeight: 'bold',
  },
  proposalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  outlineButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E53935',
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#E53935',
    fontSize: 13,
    fontWeight: '500',
  },
  filledButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#E53935',
    alignItems: 'center',
  },
  filledButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 15,
  },
  footerButtonOutline: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E53935',
    alignItems: 'center',
  },
  footerButtonOutlineText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  cancelButtonText: {
    color: '#8E5A5A',
    fontSize: 14,
    fontWeight: '500',
  },
});
