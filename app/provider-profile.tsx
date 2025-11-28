import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function ProviderProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null); // State to hold provider profile data

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Usuario no autenticado.');
        router.replace('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*') // Select all columns for the profile
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'No se pudo cargar la información del perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);

    if (error) {
      Alert.alert('Error al cerrar sesión', error.message);
    } else {
      router.replace('/login');
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {profile ? (
            <View style={styles.profileCard}>
              <View style={styles.avatarPlaceholder}>
                <FontAwesome name="user-circle" size={80} color="#ccc" />
              </View>
              <Text style={styles.profileName}>{profile.full_name}</Text>
              {profile.business_name && <Text style={styles.profileBusiness}>{profile.business_name}</Text>}
              <Text style={styles.profileEmail}>{profile.email}</Text>
              {profile.phone && <Text style={styles.profilePhone}>{profile.phone}</Text>}
              {/* Add more profile details here if needed */}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No se pudo cargar la información del perfil.</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
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
    backgroundColor: '#F9FAFB',
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
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarPlaceholder: {
    marginBottom: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileBusiness: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  profilePhone: {
    fontSize: 14,
    color: 'gray',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: 'gray',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonDisabled: {
    backgroundColor: '#ff9999',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
