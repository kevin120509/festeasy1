import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function ConfirmPaymentScreen() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta'); // 'Tarjeta' or 'Transferencia'

  const handleConfirmPayment = () => {
    Alert.alert('Pago Exitoso', 'Tu pago ha sido procesado y el proveedor ha sido confirmado.', [
      {
        text: 'OK',
        onPress: () => router.replace('/reservation-confirmed'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirmar Pago</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Service Summary Card */}
          <View style={styles.summaryCard}>
            {/* Provider Header */}
            <View style={styles.providerHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>PRO</Text>
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerTitle}>Sonido e Iluminación Pro</Text>
                <Text style={styles.providerSubtitle}>Proveedor de servicios</Text>
              </View>
            </View>

            {/* Services Included */}
            <Text style={styles.servicesIncludedTitle}>Servicios Incluidos:</Text>
            <View style={styles.serviceList}>
              <View style={styles.serviceItem}>
                <FontAwesome5 name="circle" size={8} color="black" style={styles.bullet} solid />
                <Text style={styles.serviceItemText}>DJ por 4 horas</Text>
              </View>
              <View style={styles.serviceItem}>
                <FontAwesome5 name="circle" size={8} color="black" style={styles.bullet} solid />
                <Text style={styles.serviceItemText}>Sistema de sonido profesional</Text>
              </View>
              <View style={styles.serviceItem}>
                <FontAwesome5 name="circle" size={8} color="black" style={styles.bullet} solid />
                <Text style={styles.serviceItemText}>Luces de ambiente LED</Text>
              </View>
            </View>

            {/* Price Section */}
            <View style={styles.priceSeparator} />
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Precio Total:</Text>
              <Text style={styles.totalPrice}>$1,250.00</Text>
            </View>

            {/* Policy Note */}
            <View style={styles.policyNoteContainer}>
              <Text style={styles.policyNoteText}>
                Cancelación gratuita hasta 72h antes del evento.
              </Text>
            </View>
          </View>

          {/* Payment Method Selector */}
          <Text style={styles.paymentMethodTitle}>Método de Pago</Text>
          <View style={styles.paymentMethodToggle}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                paymentMethod === 'Tarjeta' && styles.toggleOptionSelected,
              ]}
              onPress={() => setPaymentMethod('Tarjeta')}>
              <Text
                style={[
                  styles.toggleOptionText,
                  paymentMethod === 'Tarjeta' && styles.toggleOptionTextSelected,
                ]}>
                Tarjeta
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                paymentMethod === 'Transferencia' && styles.toggleOptionSelected,
              ]}
              onPress={() => setPaymentMethod('Transferencia')}>
              <Text
                style={[
                  styles.toggleOptionText,
                  paymentMethod === 'Transferencia' && styles.toggleOptionTextSelected,
                ]}>
                Transferencia
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Fixed Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.payButton} onPress={handleConfirmPayment}>
            <FontAwesome5 name="lock" size={18} color="white" style={styles.payButtonIcon} />
            <Text style={styles.payButtonText}>Pagar y Confirmar</Text>
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
    flex: 1, // To center the title
    textAlign: 'center', // To center the title
    marginLeft: -35, // Adjust for back button
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for the fixed footer
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3e8d8', // Beige
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5a5a5a',
  },
  providerInfo: {
    flex: 1,
  },
  providerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  providerSubtitle: {
    fontSize: 14,
    color: 'gray',
  },
  servicesIncludedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#000',
  },
  serviceList: {
    marginBottom: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    marginRight: 10,
    color: '#000',
  },
  serviceItemText: {
    fontSize: 15,
    color: '#555',
  },
  priceSeparator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  policyNoteContainer: {
    backgroundColor: '#f3f4f6', // Light gray
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
  },
  policyNoteText: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 24,
    marginBottom: 15,
  },
  paymentMethodToggle: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb', // Light gray background for toggle
    borderRadius: 30, // Pill shape
    padding: 5,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 25,
  },
  toggleOptionSelected: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleOptionText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'gray',
  },
  toggleOptionTextSelected: {
    color: '#000',
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
  payButton: {
    backgroundColor: '#ef4444', // Red
    borderRadius: 30,
    paddingVertical: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonIcon: {
    marginRight: 10,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});