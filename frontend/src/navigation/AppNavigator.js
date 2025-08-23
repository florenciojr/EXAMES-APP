import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={AppNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}