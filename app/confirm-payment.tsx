import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function ConfirmPaymentScreen() {
  const router = useRouter();
  const { quoteId } = useLocalSearchParams();
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta'); 
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (quoteId) {
      fetchQuoteDetails();
    }
  }, [quoteId]);

  const fetchQuoteDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          proposed_price,
          provider_id,
          request_id,
          profiles:provider_id (
            full_name,
            business_name
          ),
          requests (
            id,
            title,
            client_id,
            event_date,
            event_time,
            event_id,
            location,
            address,
            guest_count,
            service_categories (
              name
            )
          )
        `)
        .eq('id', quoteId)
        .single();

      if (error) throw error;
      setQuote(data);
    } catch (error) {
      console.error('Error fetching quote:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles del pago.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!quote) return;
    setProcessing(true);

    try {
      const clientId = quote.requests.client_id;
      const providerId = quote.provider_id;
      const requestId = quote.request_id;
      const price = quote.proposed_price;
      const serviceName = quote.requests.service_categories?.name || quote.requests.title;
      const serviceDate = quote.requests.event_date;
      const serviceTime = quote.requests.event_time;
      
      let eventId = quote.requests.event_id;

      // 0. Ensure Event Exists
      if (!eventId) {
          const { data: newEvent, error: eventError } = await supabase
            .from('events')
            .insert({
                client_id: clientId,
                title: quote.requests.title,
                event_date: serviceDate,
                event_time: serviceTime,
                location: quote.requests.location,
                address: quote.requests.address,
                guest_count: quote.requests.guest_count,
                status: 'confirmed'
            })
            .select('id')
            .single();
          
          if (eventError) throw eventError;
          eventId = newEvent.id;

          // Link event to request
          await supabase
            .from('requests')
            .update({ event_id: eventId })
            .eq('id', requestId);
      }

      // 1. Create Payment Record (Mocking success)
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          quote_id: quoteId,
          client_id: clientId,
          provider_id: providerId,
          amount: price,
          payment_method: paymentMethod,
          status: 'completed',
          paid_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // 2. Update Quote Status
      const { error: quoteUpdateError } = await supabase
        .from('quotes')
        .update({ status: 'accepted' })
        .eq('id', quoteId);

      if (quoteUpdateError) throw quoteUpdateError;

      // 3. Update Request Status
      const { error: requestUpdateError } = await supabase
        .from('requests')
        .update({ status: 'hired' })
        .eq('id', requestId);

      if (requestUpdateError) throw requestUpdateError;

      // 4. Create Hired Service (The Ticket/Reservation)
      const { error: hiredServiceError } = await supabase
        .from('hired_services')
        .insert({
          event_id: eventId,
          quote_id: quoteId,
          client_id: clientId,
          provider_id: providerId,
          service_name: serviceName,
          service_date: serviceDate,
          service_time: serviceTime,
          price_paid: price,
          status: 'reserved',
          payment_id: paymentData.id
        });

      if (hiredServiceError) throw hiredServiceError;

      Alert.alert('Pago Exitoso', 'Tu pago ha sido procesado y el proveedor ha sido confirmado.', [
        {
          text: 'OK',
          onPress: () => router.replace('/reservation-confirmed'),
        },
      ]);

    } catch (error: any) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', error.message || 'Hubo un problema al procesar el pago.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        </SafeAreaView>
    )
  }

  if (!quote) {
      return (
          <SafeAreaView style={styles.safeArea}>
              <View style={styles.container}>
                  <Text style={{textAlign: 'center', marginTop: 20}}>No se encontró la información.</Text>
              </View>
          </SafeAreaView>
      )
  }

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
                <Text style={styles.providerTitle}>
                    {quote.profiles?.business_name || quote.profiles?.full_name || 'Proveedor'}
                </Text>
                <Text style={styles.providerSubtitle}>Proveedor de servicios</Text>
              </View>
            </View>

            {/* Services Included */}
            <Text style={styles.servicesIncludedTitle}>Servicio a Contratar:</Text>
            <View style={styles.serviceList}>
              <View style={styles.serviceItem}>
                <FontAwesome5 name="check-circle" size={14} color="#ef4444" style={styles.bullet} solid />
                <Text style={styles.serviceItemText}>
                    {quote.requests?.service_categories?.name || quote.requests?.title}
                </Text>
              </View>
              <View style={styles.serviceItem}>
                <FontAwesome5 name="calendar-alt" size={14} color="#555" style={styles.bullet} solid />
                <Text style={styles.serviceItemText}>
                    Fecha: {quote.requests?.event_date}
                </Text>
              </View>
            </View>

            {/* Price Section */}
            <View style={styles.priceSeparator} />
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Precio Total:</Text>
              <Text style={styles.totalPrice}>${quote.proposed_price}</Text>
            </View>

            {/* Policy Note */}
            <View style={styles.policyNoteContainer}>
              <Text style={styles.policyNoteText}>
                Al confirmar, aceptas los términos y condiciones de FestEasy.
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
          <TouchableOpacity 
            style={[styles.payButton, processing && styles.payButtonDisabled]} 
            onPress={handleConfirmPayment}
            disabled={processing}
          >
            {processing ? (
                <ActivityIndicator color="white" />
            ) : (
                <>
                    <FontAwesome5 name="lock" size={18} color="white" style={styles.payButtonIcon} />
                    <Text style={styles.payButtonText}>Pagar y Confirmar</Text>
                </>
            )}
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
    flex: 1, 
    textAlign: 'center', 
    marginLeft: -35, 
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, 
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
    backgroundColor: '#f3e8d8', 
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
  payButtonDisabled: {
      backgroundColor: '#fca5a5'
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