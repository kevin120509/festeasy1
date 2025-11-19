import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);

  // State for form inputs can be added here
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    // Basic validation
    if (!fullName || !email || !phone || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    // Handle registration logic here
    Alert.alert('Éxito', 'Cuenta creada correctamente.');
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.card}>
            <Text style={styles.headerTitle}>Crear Cuenta</Text>
            <Text style={styles.headerSubtitle}>
              Organiza tus eventos de forma fácil y rápida.
            </Text>

            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre completo</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color="gray" style={styles.icon} />
                <TextInput
                  placeholder="John Doe"
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color="gray" style={styles.icon} />
                <TextInput
                  placeholder="tu.correo@ejemplo.com"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Teléfono</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="phone" size={20} color="gray" style={styles.icon} />
                <TextInput
                  placeholder="123-456-7890"
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color="gray" style={styles.icon} />
                <TextInput
                  placeholder="********"
                  style={styles.input}
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                  <MaterialIcons
                    name={passwordVisible ? 'visibility-off' : 'visibility'}
                    size={22}
                    color="gray"
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Registrar</Text>
            </TouchableOpacity>

            {/* Footer Navigation */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.footerText, styles.loginLink]}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'gray',
  },
  loginLink: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
});
