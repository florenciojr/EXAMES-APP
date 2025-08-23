import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { authService } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!isLogin && !name) {
      Alert.alert('Erro', 'Por favor, informe seu nome');
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (isLogin) {
        // Login
        response = await authService.login(email, password);
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
      } else {
        // Registro
        response = await authService.register({ name, email, password });
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
      }
      
      // Navegar para a tela de exames
      navigation.navigate('Exams', { 
        name: response.user.name,
        userId: response.user.id 
      });
      
    } catch (error) {
      console.error('Erro na autenticação:', error);
      Alert.alert('Erro', error.message || 'Erro de conexão. Verifique o servidor.');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App de Exames ^_~</Text>
      
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Digite seu email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Digite sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isLogin ? 'Entrar' : 'Registrar'}
          </Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => !loading && setIsLogin(!isLogin)}
        disabled={loading}
      >
        <Text style={styles.switchText}>
          {isLogin ? 'Não tem conta? Registrar' : 'Já tem conta? Entrar'}
        </Text>
      </TouchableOpacity>

      {/* Botão para testar conexão */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#666', marginTop: 20 }]}
        onPress={async () => {
          try {
            const response = await fetch('http://localhost:5000/api/health');
            const data = await response.json();
            Alert.alert('Conexão', `Backend: ${data.message}`);
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível conectar ao servidor');
          }
        }}
      >
        <Text style={styles.buttonText}>Testar Conexão</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { 
    width: '80%', 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#ccc',
    borderRadius: 8, 
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 15, 
    borderRadius: 8, 
    width: '80%', 
    alignItems: 'center' 
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: { color: '#fff', fontSize: 16 },
  switchButton: {
    marginTop: 15
  },
  switchText: {
    color: '#007AFF',
    fontSize: 14
  }

  
});