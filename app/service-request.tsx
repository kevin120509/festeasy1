import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ServiceRequestScreen() {
  const router = useRouter();
  const { categoryId, categoryName } = useLocalSearchParams();

  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description || !eventDate || !eventTime || !location || !guestCount) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'Usuario no autenticado.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('requests').insert({
        client_id: user.id,
        category_id: categoryId, // Assuming categoryId is passed correctly
        title: `Solicitud de ${categoryName || 'Servicio'}`, // Default title
        description: description,
        event_date: eventDate, // Ensure this format matches DB (YYYY-MM-DD) or let Supabase handle flexible date strings if configured
        event_time: eventTime,
        location: location,
        address: location, // Using location as address for now
        guest_count: parseInt(guestCount),
        status: 'open'
      });

      if (error) {
        throw error;
      }

      Alert.alert('Éxito', 'Solicitud enviada correctamente', [
        { text: 'OK', onPress: () => router.push('/my-requests') }
      ]);

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Hubo un problema al enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Describe lo que necesitas para {categoryName}</Text>

            {/* Description Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción del evento</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Ej: Necesito decoración con globos y temática de superhéroes..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                />
            </View>

            {/* Date and Time Row */}
            <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={styles.label}>Fecha (AAAA-MM-DD)</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="calendar-outline" size={20} color="gray" style={styles.icon} />
                        <TextInput 
                          style={styles.input} 
                          placeholder="2024-12-31" 
                          value={eventDate}
                          onChangeText={setEventDate}
                        />
                    </View>
                </View>
                <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={styles.label}>Hora (HH:MM)</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="time-outline" size={20} color="gray" style={styles.icon} />
                        <TextInput 
                          style={styles.input} 
                          placeholder="14:00" 
                          value={eventTime}
                          onChangeText={setEventTime}
                        />
                    </View>
                </View>
            </View>

            {/* Location Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Ubicación o dirección</Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                      style={styles.input} 
                      placeholder="Calle Falsa 123, Ciudad" 
                      value={location}
                      onChangeText={setLocation}
                    />
                    <Ionicons name="location-outline" size={22} color="gray" style={styles.iconRight} />
                </View>
            </View>

            {/* Guests Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Número de invitados</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: 50"
                    keyboardType="numeric"
                    value={guestCount}
                    onChangeText={setGuestCount}
                />
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Enviar solicitud</Text>
                )}
            </TouchableOpacity>
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
    borderRadius: 20,
    padding: 20,
  },
  header: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 0,
    flex: 1,
  },
  multilineInput: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    borderWidth: 0,
  },
  icon: {
    marginLeft: 12,
  },
  iconRight: {
      marginRight: 12,
  },
  submitButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ff9999',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
