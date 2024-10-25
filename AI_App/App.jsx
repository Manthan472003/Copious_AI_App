import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FinalSummary from './src/components/FinalSummary';
import Home from './src/components/Home';
import Questions from './src/components/Questions';
import React from 'react';
import { StyleSheet, View, } from 'react-native';

const Stack = createStackNavigator();


const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Questions" component={Questions} />
        <Stack.Screen name="FinalSummary" component={FinalSummary} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({})

export default App;