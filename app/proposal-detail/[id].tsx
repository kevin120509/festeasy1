import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ProposalDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;

  // Mock data for proposals (can be expanded to include more details based on 'id')
  const proposalData = {
    'catering-delicias-prop-1': {
      rating: 4.5,
      reviews: 120,
      price: '$15,000.00',
      ratingBreakdown: [
        { stars: 5, percentage: 70 },
        { stars: 4, percentage: 20 },
        { stars: 3, percentage: 5 },
        { stars: 2, percentage: 3 },
        { stars: 1, percentage: 2 },
      ],
      includes: [
        'Menú de 3 tiempos para 50 personas (entrada, plato fuerte, postre).',
        'Bebidas ilimitadas (refrescos, agua, jugos naturales).',
        'Personal de servicio (meseros, capitán, cocineros).',
        'Montaje de mesas, sillas y mantelería básica.',
      ],
      notes:
        'Nuestra propuesta de catering está diseñada para ofrecer una experiencia gastronómica inolvidable. Incluye opciones personalizables y se adapta a sus necesidades dietéticas. Válido por 30 días a partir de la fecha de emisión.',
    },
    // Add more mock data for other proposals if needed
  };

  const currentProposal = proposalData[id as string] || proposalData['catering-delicias-prop-1']; // Default if ID not found

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome5
          key={i}
          name={i <= Math.floor(rating) ? 'star' : 'star'}
          solid={i <= Math.floor(rating)}
          size={20}
          color="#FFD700" // Gold color for stars
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Propuesta de Catering Delicias</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Rating Section */}
          <View style={styles.section}>
            <View style={styles.mainRating}>
              <Text style={styles.mainRatingNumber}>{currentProposal.rating}</Text>
              {renderStars(currentProposal.rating)}
            </View>
            <Text style={styles.reviewCount}>Basado en {currentProposal.reviews} reseñas</Text>

            <View style={styles.ratingBreakdown}>
              {currentProposal.ratingBreakdown.map((item) => (
                <View key={item.stars} style={styles.progressBarContainer}>
                  <Text style={styles.progressBarText}>{item.stars}</Text>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${item.percentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressBarText}>{item.percentage}%</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.section}>
            <Text style={styles.priceTitle}>Precio final</Text>
            <Text style={styles.totalPrice}>{currentProposal.price}</Text>
          </View>

          {/* What's Included Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Qué incluye</Text>
            {currentProposal.includes.map((item, index) => (
              <View key={index} style={styles.includeItem}>
                <Ionicons name="checkmark-circle" size={20} color="green" style={styles.checkmarkIcon} />
                <Text style={styles.includeText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Provider Notes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas del proveedor</Text>
            <Text style={styles.notesText}>{currentProposal.notes}</Text>
          </View>
        </ScrollView>

        {/* Fixed Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.chooseProviderButton}
            onPress={() => router.push('/confirm-payment')}
          >
            <Text style={styles.chooseProviderButtonText}>Elegir este proveedor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButtonFooter} onPress={() => router.back()}>
            <Text style={styles.backButtonFooterText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
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
    color: '#000',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for the fixed footer
  },
  section: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mainRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  mainRatingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#000',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  reviewCount: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 15,
  },
  ratingBreakdown: {
    marginTop: 10,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressBarText: {
    width: 25,
    fontSize: 12,
    color: 'gray',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fca5a5', // Light red
    borderRadius: 4,
  },
  priceTitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 5,
  },
  totalPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  checkmarkIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  includeText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  chooseProviderButton: {
    backgroundColor: '#ef4444', // Red
    borderRadius: 25,
    paddingVertical: 14,
    width: '60%',
    alignItems: 'center',
  },
  chooseProviderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonFooter: {
    borderRadius: 25,
    paddingVertical: 14,
    width: '35%',
    alignItems: 'center',
    borderColor: 'transparent',
  },
  backButtonFooterText: {
    color: 'gray',
    fontSize: 16,
    fontWeight: 'bold',
  },
});