import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import LoginScreen from './src/screens/LoginScreen';
import ExamsScreen from './src/screens/ExamsScreen';
import QuestionScreen from './src/screens/QuestionScreen';
import ProgressScreen from './src/screens/ProgressScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ 
              headerShown: false,
              title: 'Login'
            }}
          />
          <Stack.Screen 
            name="Exams" 
            component={ExamsScreen} 
            options={{ 
              title: 'Exames Disponíveis',
              headerBackTitle: 'Sair'
            }}
          />
          <Stack.Screen 
            name="Question" 
            component={QuestionScreen} 
            options={{ 
              title: 'Responder Questões',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="Progress" 
            component={ProgressScreen} 
            options={{ 
              title: 'Meu Progresso',
              headerBackTitle: 'Voltar'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
// 