import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import ExamsScreen from '../screens/ExamsScreen';
import QuestionScreen from '../screens/QuestionScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Exams" component={ExamsScreen} />
        <Stack.Screen name="Question" component={QuestionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
