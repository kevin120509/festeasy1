import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ServiceRequestScreen() {
  const router = useRouter();

  const handleSubmit = () => {
    // Logic to handle form submission would go here
    router.push('/my-requests');
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
            <Text style={styles.title}>Describe lo que necesitas</Text>

            {/* Description Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción del evento</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Ej: Necesito decoración con globos y temática de superhéroes para un cumpleaños infantil. El lugar es un salón de 50m²..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

            {/* Date and Time Row */}
            <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={styles.label}>Fecha del evento</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="calendar-outline" size={20} color="gray" style={styles.icon} />
                        <TextInput style={styles.input} placeholder="DD/MM/AAAA" />
                    </View>
                </View>
                <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={styles.label}>Hora de Inicio</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="time-outline" size={20} color="gray" style={styles.icon} />
                        <TextInput style={styles.input} placeholder="HH:MM" />
                    </View>
                </View>
            </View>

            {/* Location Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Ubicación o dirección</Text>
                <View style={styles.inputContainer}>
                    <TextInput style={styles.input} placeholder="Calle Falsa 123, Ciudad" />
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
                />
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Enviar solicitud</Text>
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
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
