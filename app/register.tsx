import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function RegisterScreen() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);

  // State for form inputs
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'provider'>('client');
  const [loading, setLoading] = useState(false);
  
  // Categories state
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('id, name, icon')
      .eq('active', true);
    
    if (!error && data) {
      setCategories(data);
    }
  };

  const handleRegister = async () => {
    // Basic validation
    if (!fullName || !email || !phone || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (role === 'provider') {
        if (!businessName) {
            Alert.alert('Error', 'Por favor, ingresa el nombre de tu negocio.');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Error', 'Por favor, selecciona la categoría principal de tu servicio.');
            return;
        }
    }

    setLoading(true);

    // 1. Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          role: role,
          business_name: role === 'provider' ? businessName : null,
        },
      },
    });

    if (error) {
      setLoading(false);
      Alert.alert('Error al registrarse', error.message);
      return;
    }

    if (data.user) {
      // 2. Insert/Upsert into public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: role,
          phone: phone,
          business_name: role === 'provider' ? businessName : null,
          updated_at: new Date(),
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        setLoading(false);
        Alert.alert('Advertencia', 'Usuario creado, pero hubo un problema al guardar el perfil.');
        return;
      }

      // 3. Create Initial Service (if Provider)
      if (role === 'provider' && selectedCategory) {
          // Find the category name
          const catName = categories.find(c => c.id === selectedCategory)?.name || 'Servicio General';
          
          const { error: serviceError } = await supabase
            .from('services')
            .insert({
                provider_id: data.user.id,
                category_id: selectedCategory,
                name: catName, // Critical: Use the category name
                description: `Servicios profesionales de ${catName}`,
                base_price: 0, 
                active: true
            });
          
          if (serviceError) {
              console.error('Error creating initial service:', serviceError);
          }
      }

      setLoading(false);

      Alert.alert(
        'Éxito',
        'Cuenta creada correctamente. Por favor, verifica tu correo electrónico si es necesario.',
        [
          { text: 'OK', onPress: () => router.push('/login') }
        ]
      );
    } else {
      setLoading(false);
    }
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

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.label}>Soy un:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'client' && styles.roleButtonActive]}
                  onPress={() => setRole('client')}
                >
                  <FontAwesome5 name="user" size={20} color={role === 'client' ? 'white' : 'gray'} />
                  <Text style={[styles.roleButtonText, role === 'client' && styles.roleButtonTextActive]}>Cliente</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'provider' && styles.roleButtonActive]}
                  onPress={() => setRole('provider')}
                >
                  <FontAwesome5 name="store" size={18} color={role === 'provider' ? 'white' : 'gray'} />
                  <Text style={[styles.roleButtonText, role === 'provider' && styles.roleButtonTextActive]}>Proveedor</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Provider Specific Fields */}
            {role === 'provider' && (
              <>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nombre del Negocio</Text>
                    <View style={styles.inputWrapper}>
                    <FontAwesome5 name="building" size={18} color="gray" style={styles.icon} />
                    <TextInput
                        placeholder="Ej. Eventos Mágicos"
                        style={styles.input}
                        value={businessName}
                        onChangeText={setBusinessName}
                    />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Categoría Principal de Servicio</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryPill,
                                    selectedCategory === cat.id && styles.categoryPillActive
                                ]}
                                onPress={() => setSelectedCategory(cat.id)}
                            >
                                <Text style={[
                                    styles.categoryPillText,
                                    selectedCategory === cat.id && styles.categoryPillTextActive
                                ]}>
                                    {cat.name.toLowerCase() === 'floristeria' ? 'Floreria' : cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
              </>
            )}

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
            <TouchableOpacity 
                style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
                onPress={handleRegister}
                disabled={loading}
            >
              {loading ? (
                  <ActivityIndicator color="white" />
              ) : (
                  <Text style={styles.registerButtonText}>Registrar</Text>
              )}
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
  roleContainer: {
    marginBottom: 20,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  roleButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  roleButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: 'gray',
  },
  roleButtonTextActive: {
    color: 'white',
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
    width: 20,
    textAlign: 'center',
  },
  eyeIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoriesList: {
      flexDirection: 'row',
      marginBottom: 5,
  },
  categoryPill: {
      backgroundColor: '#f3f4f6',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 10,
      borderWidth: 1,
      borderColor: '#eee',
  },
  categoryPillActive: {
      backgroundColor: '#fee2e2', // Light red
      borderColor: '#ef4444',
  },
  categoryPillText: {
      fontSize: 13,
      color: '#374151',
  },
  categoryPillTextActive: {
      color: '#ef4444',
      fontWeight: 'bold',
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
  registerButtonDisabled: {
    backgroundColor: '#ff9999',
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
