import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface RequestDetail {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  guest_count: number;
  service_categories: {
    name: string;
  };
}

interface Quote {
  id: string;
  proposed_price: number;
  notes: string;
  status: string;
  profiles: {
    full_name: string;
    business_name: string;
    avatar_url: string;
  };
}

export default function RequestDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Provider specific state
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasQuoted, setHasQuoted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);

      // 0. Get User and Role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          setLoading(false);
          return; 
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      const role = profile?.role || 'client';
      setUserRole(role);

      // 1. Fetch request details
      const { data: requestData, error: requestError } = await supabase
        .from('requests')
        .select(`
          id,
          title,
          description,
          event_date,
          event_time,
          location,
          guest_count,
          service_categories (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (requestError) throw requestError;

      setRequest(requestData as any);

      // 2. Logic based on Role
      if (role === 'provider') {
          // Check if I have quoted
          const { data: myQuote } = await supabase
            .from('quotes')
            .select('id')
            .eq('request_id', id)
            .eq('provider_id', user.id)
            .maybeSingle();
          
          if (myQuote) {
              setHasQuoted(true);
          }
      } else {
          // Client: Fetch all quotes
          const { data: quotesData, error: quotesError } = await supabase
            .from('quotes')
            .select(`
              id,
              proposed_price,
              notes,
              status,
              profiles (
                full_name,
                business_name,
                avatar_url
              )
            `)
            .eq('request_id', id);

          if (quotesError) throw quotesError;

          setQuotes(quotesData as any || []);
      }

    } catch (error: any) {
      console.error('Error fetching details:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles de la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async () => {
      if (!quotePrice || !quoteNotes) {
          Alert.alert('Error', 'Por favor ingresa el precio y una descripción de tu propuesta.');
          return;
      }

      setSubmitting(true);

      try {
          const { error } = await supabase.from('quotes').insert({
              request_id: id,
              provider_id: userId,
              proposed_price: parseFloat(quotePrice),
              notes: quoteNotes,
              status: 'pending'
          });

          if (error) throw error;

          // Optionally update request status to 'quoted'
          await supabase
            .from('requests')
            .update({ status: 'quoted' })
            .eq('id', id)
            .eq('status', 'open'); // Only update if currently open

          Alert.alert('Éxito', 'Cotización enviada correctamente', [
              { text: 'OK', onPress: () => router.back() }
          ]);
      } catch (error: any) {
          console.error('Error sending quote:', error);
          Alert.alert('Error', 'No se pudo enviar la cotización.');
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>No se encontró la solicitud.</Text>
          <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
             <Text style={{color: '#EF4444'}}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.categoryTitle}>Categoría: {request.service_categories?.name}</Text>
            <Text style={styles.descriptionTitle}>Descripción:</Text>
            <Text style={styles.descriptionText}>{request.description}</Text>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#EF4444" style={styles.icon} />
              <View>
                <Text style={styles.infoLabel}>Fecha y Hora</Text>
                <Text style={styles.infoValue}>{request.event_date} - {request.event_time}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#EF4444" style={styles.icon} />
              <View>
                <Text style={styles.infoLabel}>Ubicación</Text>
                <Text style={styles.infoValue}>{request.location}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color="#EF4444" style={styles.icon} />
              <View>
                <Text style={styles.infoLabel}>Invitados</Text>
                <Text style={styles.infoValue}>{request.guest_count}</Text>
              </View>
            </View>
          </View>

          {/* PROVIDER VIEW: Quote Form */}
          {userRole === 'provider' && (
              <View>
                  <Text style={styles.sectionTitle}>Enviar Cotización</Text>
                  {hasQuoted ? (
                      <View style={styles.infoCard}>
                          <Ionicons name="checkmark-circle" size={40} color="#10b981" style={{marginBottom: 10}} />
                          <Text style={styles.infoCardText}>Ya has enviado una propuesta para esta solicitud.</Text>
                          <Text style={styles.infoCardSubText}>Espera la respuesta del cliente.</Text>
                      </View>
                  ) : (
                      <View style={styles.formCard}>
                          <Text style={styles.label}>Precio Estimado ($)</Text>
                          <TextInput 
                              style={styles.input} 
                              placeholder="0.00" 
                              keyboardType="numeric"
                              value={quotePrice}
                              onChangeText={setQuotePrice}
                          />

                          <Text style={styles.label}>Notas / Detalles de la Propuesta</Text>
                          <TextInput 
                              style={[styles.input, styles.textArea]} 
                              placeholder="Describe qué incluye tu servicio..." 
                              multiline
                              numberOfLines={4}
                              textAlignVertical="top"
                              value={quoteNotes}
                              onChangeText={setQuoteNotes}
                          />

                          <TouchableOpacity 
                              style={[styles.submitButton, submitting && styles.disabledButton]}
                              onPress={handleSendQuote}
                              disabled={submitting}
                          >
                              {submitting ? (
                                  <ActivityIndicator color="white" />
                              ) : (
                                  <Text style={styles.submitButtonText}>Enviar Cotización</Text>
                              )}
                          </TouchableOpacity>
                      </View>
                  )}
              </View>
          )}

          {/* CLIENT VIEW: Proposals List */}
          {userRole === 'client' && (
            <>
                <Text style={styles.sectionTitle}>Cotizaciones Recibidas ({quotes.length})</Text>

                {quotes.length === 0 ? (
                    <View style={styles.emptyQuotes}>
                    <Text style={styles.emptyQuotesText}>Aún no has recibido cotizaciones para esta solicitud.</Text>
                    </View>
                ) : (
                    quotes.map((quote) => (
                    <View key={quote.id} style={styles.proposalCard}>
                        <Text style={styles.providerName}>
                        {quote.profiles?.business_name || quote.profiles?.full_name || 'Proveedor'}
                        </Text>
                        
                        <Text style={styles.quoteNotes}>{quote.notes}</Text>

                        <Text style={styles.proposalPrice}>
                        Cotización: <Text style={styles.priceValue}>${quote.proposed_price}</Text>
                        </Text>

                        <View style={styles.proposalActions}>
                        <TouchableOpacity
                            style={styles.outlineButton}
                            onPress={() => router.push(`/proposal-detail/${quote.id}`)}
                        >
                            <Text style={styles.outlineButtonText}>Ver detalles</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.filledButton}
                            onPress={() => router.push({ pathname: '/confirm-payment', params: { quoteId: quote.id } })}
                        >
                            <Text style={styles.filledButtonText}>Aceptar</Text>
                        </TouchableOpacity>
                        </View>
                    </View>
                    ))
                )}
            </>
          )}
        </ScrollView>

        {/* Footer Actions (Only for Client) */}
        {userRole === 'client' && (
            <View style={styles.footer}>
            <TouchableOpacity style={styles.footerButtonOutline}>
                <Text style={styles.footerButtonOutlineText}>Editar solicitud</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerButtonOutline, styles.cancelButton]}>
                <Text style={styles.cancelButtonText}>Cancelar solicitud</Text>
            </TouchableOpacity>
            </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Very light gray background
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
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
    paddingBottom: 100, // Space for the footer
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563', // Gray 600
    lineHeight: 20,
    marginBottom: 15,
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
  icon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: 'gray',
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
    borderRadius: 16,
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
    color: '#1F2937',
  },
  quoteNotes: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  proposalPrice: {
    fontSize: 14,
    marginBottom: 15,
    color: '#000',
  },
  priceValue: {
    color: '#EF4444', // Red
    fontWeight: 'bold',
    fontSize: 16,
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
    borderColor: '#EF4444', // Red border
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#EF4444', // Red text
    fontSize: 13,
    fontWeight: '500',
  },
  filledButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#EF4444', // Red background
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
    borderColor: '#EF4444', // Red border
    alignItems: 'center',
  },
  footerButtonOutlineText: {
    color: '#EF4444', // Red text
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    borderColor: '#ddd', // Gray border
    backgroundColor: '#f9f9f9',
  },
  cancelButtonText: {
    color: 'gray', // Gray text
    fontSize: 14,
    fontWeight: '500',
  },
  emptyQuotes: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
  },
  emptyQuotesText: {
    color: 'gray',
    textAlign: 'center',
  },
  // Form Styles
  formCard: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
  },
  label: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#374151',
      marginBottom: 8,
  },
  input: {
      backgroundColor: '#f9fafb',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      marginBottom: 20,
  },
  textArea: {
      height: 100,
      textAlignVertical: 'top',
  },
  submitButton: {
      backgroundColor: '#ef4444',
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
  },
  disabledButton: {
      backgroundColor: '#fca5a5',
  },
  submitButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
  },
  infoCard: {
      alignItems: 'center',
      padding: 30,
      backgroundColor: '#f0fdf4',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#bbf7d0',
  },
  infoCardText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#166534',
      textAlign: 'center',
  },
  infoCardSubText: {
      fontSize: 14,
      color: '#166534',
      marginTop: 5,
      textAlign: 'center',
  }
});
