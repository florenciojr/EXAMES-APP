import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ola ^_~ esse sera App de Exames</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu nome"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => name.trim() !== '' && navigation.navigate('Exams', { name })}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '80%', padding: 10, borderWidth: 1, borderRadius: 8, marginBottom: 20 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, width: '80%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
