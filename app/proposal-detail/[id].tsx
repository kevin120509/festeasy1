import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function ProposalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace('/login');
        return;
      }

      // Get user role from metadata or profile
      // For simplicity, let's verify via the quote ownership
      // But typically we might store role in metadata
      const role = user.user_metadata?.role || 'client';
      setUserRole(role);

      // Fetch Quote with Request and Provider Profile
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          requests (
            id,
            client_id,
            title,
            event_date,
            location,
            description,
            status
          ),
          profiles:provider_id (
            full_name,
            business_name,
            phone,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setQuote(data);

    } catch (error: any) {
      console.error('Error fetching proposal details:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la propuesta.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleContactProvider = async () => {
    try {
      // setLoading(true); // Don't block UI completely, maybe just button
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !quote) return;

      const clientId = quote.requests.client_id;
      const providerId = quote.provider_id;
      const requestId = quote.request_id;

      // Check if channel exists
      const { data: existingChannel, error: fetchError } = await supabase
        .from('chat_channels')
        .select('id')
        .eq('request_id', requestId)
        .eq('client_id', clientId)
        .eq('provider_id', providerId)
        .maybeSingle(); // Use maybeSingle to avoid error if not found

      if (existingChannel) {
        router.push(`/chat/${existingChannel.id}`);
        return;
      }

      // Create new channel
      console.log('Creating chat channel for:', { requestId, clientId, providerId });
      
      const { data: newChannel, error: createError } = await supabase
        .from('chat_channels')
        .insert({
          request_id: requestId,
          client_id: clientId,
          provider_id: providerId
        })
        .select()
        .single();

      if (createError) {
        console.error('Supabase create channel error:', createError);
        throw createError;
      }
      
      if (newChannel) {
        router.push(`/chat/${newChannel.id}`);
      }

    } catch (error: any) {
      console.error('Error initiating chat:', error);
      if (error.message?.includes('row-level security') || error.code === '42501') {
          Alert.alert('Error de Permisos', 'No tienes permiso para crear un chat. Ejecuta el script SQL de políticas.');
      } else {
          Alert.alert('Error', `No se pudo iniciar el chat: ${error.message || 'Error desconocido'}`);
      }
    }
  };

  const handleAcceptProposal = async () => {
    if (!quote) return;
    Alert.alert('Funcionalidad', 'Aquí iría la lógica para aceptar la propuesta y proceder al pago.');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      </SafeAreaView>
    );
  }

  if (!quote) return null;

  const isProvider = userRole === 'provider';
  const request = quote.requests;
  const provider = quote.profiles;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isProvider ? 'Detalle de Cotización' : `Propuesta de ${provider?.business_name || provider?.full_name}`}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
            
          {/* Request Details Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Información de la Solicitud</Text>
            
            <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color="#555" style={styles.icon} />
                <View style={styles.infoContent}>
                    <Text style={styles.label}>Fecha del Evento</Text>
                    <Text style={styles.value}>{request?.event_date}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color="#555" style={styles.icon} />
                <View style={styles.infoContent}>
                    <Text style={styles.label}>Ubicación</Text>
                    <Text style={styles.value}>{request?.location || 'No especificada'}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <MaterialCommunityIcons name="text-box-outline" size={20} color="#555" style={styles.icon} />
                <View style={styles.infoContent}>
                    <Text style={styles.label}>Descripción del Cliente</Text>
                    <Text style={styles.value}>{request?.description || 'Sin descripción adicional.'}</Text>
                </View>
            </View>
          </View>

          {/* Quote Details Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Detalles de la Cotización</Text>

            <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Precio Cotizado</Text>
                <Text style={styles.priceValue}>${quote.proposed_price}</Text>
            </View>

            <View style={styles.infoRow}>
                <MaterialCommunityIcons name="comment-quote-outline" size={20} color="#555" style={styles.icon} />
                <View style={styles.infoContent}>
                    <Text style={styles.label}>Mensaje / Notas</Text>
                    <Text style={styles.value}>{quote.content || 'Sin notas adicionales.'}</Text>
                </View>
            </View>
            
            <View style={styles.statusContainer}>
                 <Text style={styles.statusLabel}>Estado: </Text>
                 <View style={[
                     styles.statusBadge, 
                     quote.status === 'accepted' ? styles.statusAccepted : 
                     quote.status === 'rejected' ? styles.statusRejected : styles.statusPending
                 ]}>
                     <Text style={[
                         styles.statusText,
                         quote.status === 'accepted' ? styles.statusTextAccepted : 
                         quote.status === 'rejected' ? styles.statusTextRejected : styles.statusTextPending
                     ]}>
                        {quote.status === 'accepted' ? 'Aceptada' : 
                         quote.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                     </Text>
                 </View>
            </View>
          </View>

          {/* Provider Info (Only for Client view) */}
          {!isProvider && (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Sobre el Proveedor</Text>
                <Text style={styles.providerName}>{provider?.business_name || provider?.full_name || 'Proveedor'}</Text>
                <Text style={styles.providerContact}>{provider?.email || 'Email no disponible'}</Text>
                <Text style={styles.providerContact}>{provider?.phone || 'Teléfono no disponible'}</Text>
                
                <TouchableOpacity style={styles.chatButton} onPress={handleContactProvider}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.chatButtonText}>Enviar Mensaje</Text>
                </TouchableOpacity>
            </View>
          )}

        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          {!isProvider && quote.status === 'pending' ? (
             <View style={styles.footerButtons}>
                 <TouchableOpacity style={[styles.footerBtn, styles.backButtonFooter]} onPress={() => router.back()}>
                    <Text style={styles.backButtonFooterText}>Volver</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                    style={[styles.footerBtn, styles.chooseProviderButton]}
                    onPress={handleAcceptProposal}
                  >
                    <Text style={styles.chooseProviderButtonText}>Elegir proveedor</Text>
                 </TouchableOpacity>
             </View>
          ) : (
             <TouchableOpacity style={[styles.footerBtn, styles.backButtonFooter, { width: '100%' }]} onPress={() => router.back()}>
                <Text style={styles.backButtonFooterText}>Volver</Text>
             </TouchableOpacity>
          )}
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
    color: '#111827',
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150, // Increased padding to ensure footer doesn't cover content
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  priceContainer: {
      alignItems: 'center',
      marginBottom: 20,
      backgroundColor: '#fef2f2',
      padding: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#fee2e2',
  },
  priceLabel: {
      fontSize: 14,
      color: '#ef4444',
      fontWeight: '600',
      marginBottom: 5,
  },
  priceValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#b91c1c',
  },
  statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      justifyContent: 'flex-end',
  },
  statusLabel: {
      fontSize: 14,
      color: '#6b7280',
      marginRight: 5,
  },
  statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
  },
  statusPending: { backgroundColor: '#fff7ed' },
  statusAccepted: { backgroundColor: '#dcfce7' },
  statusRejected: { backgroundColor: '#fef2f2' },
  
  statusText: { fontSize: 14, fontWeight: 'bold' },
  statusTextPending: { color: '#c2410c' },
  statusTextAccepted: { color: '#15803d' },
  statusTextRejected: { color: '#b91c1c' },

  providerName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 5,
  },
  providerContact: {
      fontSize: 14,
      color: '#555',
      marginBottom: 2,
  },
  chatButton: {
      flexDirection: 'row',
      backgroundColor: '#ef4444', // Red
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 15,
  },
  chatButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  footerBtn: {
      borderRadius: 10,
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
  },
  chooseProviderButton: {
    backgroundColor: '#ef4444',
    width: '68%',
  },
  chooseProviderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonFooter: {
    backgroundColor: '#f3f4f6',
    width: '30%',
  },
  backButtonFooterText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
  },
});