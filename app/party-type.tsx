import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const partyOptions = [
  { id: '1', title: 'Fiesta Infantil', description: 'Celebra a los más pequeños.', icon: 'cake-variant', iconType: 'MaterialCommunityIcons' },
  { id: '2', title: 'XV Años', description: 'Un momento inolvidable.', icon: 'crown', iconType: 'MaterialCommunityIcons' },
  { id: '3', title: 'Boda', description: 'El día más especial.', icon: 'heart', iconType: 'Ionicons' },
  { id: '4', title: 'Baby Shower', description: 'Bienvenida al nuevo bebé.', icon: 'baby-carriage', iconType: 'MaterialCommunityIcons' },
  { id: '5', title: 'Evento Corporativo', description: 'Profesional y memorable.', icon: 'briefcase', iconType: 'Ionicons' },
  { id: '6', title: 'Reunión Familiar', description: 'Momentos para compartir.', icon: 'home', iconType: 'Ionicons' },
  { id: '7', title: 'Otro', description: 'Personaliza tu evento.', icon: 'options', iconType: 'Ionicons' },
];

const renderIcon = (type, name, color, size) => {
  if (type === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={name} size={size} color={color} />;
  }
  return <Ionicons name={name} size={size} color={color} />;
};

const { width } = Dimensions.get('window');
const cardMargin = 8;
const cardPadding = 10;
const numColumns = 2;
const cardSize = (width - 30 * 2 - cardMargin * 2 * numColumns) / numColumns;


export default function PartyTypeScreen() {
  const router = useRouter();
  const [selectedPartyTypeId, setSelectedPartyTypeId] = useState(null);

  const handleContinue = () => {
    if (selectedPartyTypeId) {
      router.push('/home');
    } else {
      Alert.alert('Selección requerida', 'Por favor, selecciona un tipo de fiesta para continuar.');
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = item.id === selectedPartyTypeId;
    return (
      <TouchableOpacity
        style={[
          styles.optionCard,
          isSelected ? styles.optionCardSelected : styles.optionCardDefault,
        ]}
        onPress={() => setSelectedPartyTypeId(item.id)}>
        {renderIcon(item.iconType, item.icon, isSelected ? '#ef4444' : '#f97316', 30)}
        <Text style={styles.optionTitle}>{item.title}</Text>
        <Text style={styles.optionDescription}>{item.description}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>¿Qué tipo de fiesta necesitas?</Text>

        <FlatList
          data={partyOptions}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={numColumns}
          style={styles.list}
        />

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  header: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  list: {
    flex: 1,
  },
  optionCard: {
    width: cardSize,
    height: cardSize,
    margin: cardMargin,
    borderRadius: 15,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: cardPadding,
  },
  optionCardDefault: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
  },
  optionCardSelected: {
    backgroundColor: '#ffe4e6',
    borderColor: '#ef4444',
  },
  optionTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20, // Add some space above the button
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});