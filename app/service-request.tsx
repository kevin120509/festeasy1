import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DateTimePicker from 'react-native-modal-datetime-picker';

export default function ServiceRequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Cast params to string, providing default empty strings
  const { 
    id, 
    categoryId, 
    categoryName,
    description: initialDescription,
    eventDate: initialEventDate,
    eventTime: initialEventTime,
    location: initialLocation,
    guestCount: initialGuestCount
  } = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, String(value || '')])
  );

  const isEditing = !!id;

  const [description, setDescription] = useState(initialDescription);
  const [eventDate, setEventDate] = useState(initialEventDate);
  const [eventTime, setEventTime] = useState(initialEventTime);
  const [location, setLocation] = useState(initialLocation);
  const [guestCount, setGuestCount] = useState(initialGuestCount);
  const [loading, setLoading] = useState(false);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: Date) => {
    setEventDate(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    hideDatePicker();
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleConfirmTime = (date: Date) => {
    setEventTime(date.toTimeString().split(' ')[0].substring(0, 5)); // Format as HH:MM
    hideTimePicker();
  };


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

      const requestData = {
        description: description,
        event_date: eventDate,
        event_time: eventTime,
        location: location,
        address: location,
        guest_count: parseInt(guestCount),
        // Don't update status on edit, let it keep its current status
      };

      let error;

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('requests')
          .update(requestData)
          .eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('requests').insert({
          ...requestData,
          client_id: user.id,
          category_id: categoryId,
          title: `Solicitud de ${categoryName || 'Servicio'}`,
          status: 'open'
        });
        error = insertError;
      }

      if (error) {
        throw error;
      }

      Alert.alert(
        'Éxito', 
        `Solicitud ${isEditing ? 'actualizada' : 'enviada'} correctamente`, 
        [
          { text: 'OK', onPress: () => router.replace(isEditing ? `/my-requests` : '/home') }
        ]
      );

    } catch (error: any) {
      Alert.alert('Error', error.message || `Hubo un problema al ${isEditing ? 'actualizar' : 'enviar'} la solicitud.`);
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
            <Text style={styles.title}>{isEditing ? 'Editar Solicitud' : `Describe lo que necesitas para ${categoryName}`}</Text>

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
            {/* Date Input */}
            <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.label}>Fecha</Text>
                <TouchableOpacity onPress={showDatePicker} style={styles.inputContainer}>
                    <Ionicons name="calendar-outline" size={20} color="gray" style={styles.icon} />
                    <Text style={styles.datePickerText}>{eventDate || 'Selecciona una fecha'}</Text>
                </TouchableOpacity>
                <DateTimePicker
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirmDate}
                    onCancel={hideDatePicker}
                    date={eventDate ? new Date(eventDate) : new Date()}
                />
            </View>
                <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={styles.label}>Hora</Text>
                    <TouchableOpacity onPress={showTimePicker} style={styles.inputContainer}>
                        <Ionicons name="time-outline" size={20} color="gray" style={styles.icon} />
                        <Text style={styles.datePickerText}>{eventTime || 'Selecciona una hora'}</Text>
                    </TouchableOpacity>
                    <DateTimePicker
                        isVisible={isTimePickerVisible}
                        mode="time"
                        onConfirm={handleConfirmTime}
                        onCancel={hideTimePicker}
                        date={eventTime ? new Date(`2000-01-01T${eventTime}:00`) : new Date()}
                        is24Hour={true}
                    />
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
                  <Text style={styles.submitButtonText}>{isEditing ? 'Guardar Cambios' : 'Enviar solicitud'}</Text>
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
  datePickerText: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 0,
    flex: 1,
    color: '#333', // Ensure text color is visible
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
