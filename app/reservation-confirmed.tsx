import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ReservationConfirmedScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/'); // Navigates to the home screen and resets the stack
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={60} color="#16a34a" />
          </View>
          <Text style={styles.successTitle}>¡Reserva confirmada!</Text>
          <Text style={styles.successSubtitle}>Hemos enviado los detalles a tu correo electrónico.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Details Card */}
          <View style={styles.detailsCard}>
            {/* Provider Info */}
            <View style={styles.providerRow}>
              <View style={styles.providerAvatar}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#16a34a" />
              </View>
              <View style={styles.providerTextGroup}>
                <Text style={styles.providerName}>Sabores del Chef Catering</Text>
                <Text style={styles.providerLabel}>Proveedor</Text>
              </View>
            </View>
            <View style={styles.divider} />

            {/* Info Rows */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#ef4444" />
              </View>
              <Text style={styles.infoText}>Sábado, 26 de Octubre - 4:00 PM</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="location-outline" size={20} color="#ef4444" />
              </View>
              <Text style={styles.infoText}>Av. Siempre Viva 742, Springfield</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="receipt-outline" size={20} color="#ef4444" />
              </View>
              <Text style={styles.infoText}>Paquete Fiesta Completa <Text style={styles.infoPrice}>$1,250.00</Text></Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={[styles.actionButton, styles.contactButton]}>
              <Text style={styles.contactButtonText}>Contactar proveedor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.receiptButton]}>
              <Text style={styles.receiptButtonText}>Ver comprobante</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.goHomeButton} onPress={handleGoHome}>
            <Text style={styles.goHomeButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
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
    backgroundColor: '#f9fafb',
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff', // White background for the header area
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dcfce7', // Very pale green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: 'gray',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for the fixed footer
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16a34a', // Dark green for avatar background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  providerTextGroup: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  providerLabel: {
    fontSize: 13,
    color: 'gray',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fee2e2', // Pale red
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  infoPrice: {
    fontWeight: 'bold',
    color: '#000',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
  },
  contactButton: {
    backgroundColor: '#fff',
    borderColor: '#ef4444', // Red border
  },
  contactButtonText: {
    color: '#ef4444', // Red text
    fontWeight: 'bold',
    fontSize: 15,
  },
  receiptButton: {
    backgroundColor: '#ef4444', // Red background
    borderColor: '#ef4444',
  },
  receiptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f9fafb', // Match general background
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  goHomeButton: {
    backgroundColor: '#e5e7eb', // Gray background
    borderRadius: 30,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  goHomeButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});