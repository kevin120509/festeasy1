import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Festeasy</Text>
      <Button title="Ir al Login" onPress={handleGoToLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0', // Light grey background
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#333', // Darker text color
  },
});
