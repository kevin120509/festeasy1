import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const navItems = [
  { name: 'Inicio', icon: 'home', active: true, route: '/home' },
  { name: 'Mis Solicitudes', icon: 'calendar', active: false, route: '/my-requests' },
  { name: 'Chats', icon: 'chatbubble-ellipses', active: false, route: '/chats' }, // Assuming a future /chats route
  { name: 'Perfil', icon: 'person', active: false, route: '/profile' }, // Assuming a future /profile route
]

export default function HomeScreen() {
  const router = useRouter();
  const [services, setServices] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, icon')
        .eq('active', true);

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setServices(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderService = ({ item }: { item: { id: string; name: string; icon: string } }) => (
    <TouchableOpacity 
      style={styles.serviceButton} 
      onPress={() => router.push({ pathname: '/service-request', params: { categoryId: item.id, categoryName: item.name } })}
    >
      {/* Fallback icon if the icon name from DB isn't valid in Ionicons, or handle mapping */}
      <Ionicons name={item.icon as any || 'apps'} size={22} color="#ef4444" />
      <Text style={styles.serviceText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderNavItem = (item: { name: string; icon: any; active: boolean; route: string }) => (
    <TouchableOpacity key={item.name} style={styles.navItem} onPress={() => item.route && router.push(item.route)}>
      <Ionicons
        name={item.icon}
        size={26}
        color={item.active ? '#ef4444' : 'gray'}
      />
      <Text style={[styles.navText, item.active && styles.navTextActive]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="party-popper" size={28} color="#374151" />
          <FontAwesome name="user-circle" size={28} color="#374151" />
        </View>

        <Text style={styles.title}>¿Qué servicio necesitas hoy?</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#ef4444" />
        ) : (
          <FlatList
            data={services}
            renderItem={renderService}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
          />
        )}

        <View style={styles.navBar}>
          {navItems.map(renderNavItem)}
        </View>
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
    position: 'relative',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 25,
  },
  grid: {
    paddingBottom: 80, // Space for the bottom nav bar
  },
  row: {
    justifyContent: 'space-between',
  },
  serviceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 50, // Pill shape
    paddingVertical: 12,
    paddingHorizontal: 15,
    margin: 8,
  },
  serviceText: {
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#374151',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 15,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  navTextActive: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
});
