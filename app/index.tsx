import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <FontAwesome5 name="birthday-cake" size={60} color="white" />
        </View>
        <Text style={styles.mainTitle}>Organiza tu evento en minutos</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.createAccountButtonText}>Crear cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <View style={styles.versionTextContainer}>
          <Ionicons name="information-circle-outline" size={16} color="gray" style={styles.infoIcon} />
          <Text style={styles.versionText}>Versión 1.0</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Pure white background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ef4444', // Red color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    lineHeight: 40,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  createAccountButton: {
    backgroundColor: '#ef4444', // Red color
    borderRadius: 30, // Very rounded
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  createAccountButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderColor: '#ef4444', // Red border
    borderWidth: 2,
    borderRadius: 30, // Very rounded
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#ef4444', // Red text
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  infoIcon: {
    marginRight: 5,
  },
  versionText: {
    fontSize: 13,
    color: 'gray', // Dark gray
  },
});
