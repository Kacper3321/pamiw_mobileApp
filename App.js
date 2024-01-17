import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CheckOutList from './view/CheckOutList';
import BookList from './view/BookList';
import Home from './view/Home';
import CameraScreen from './CameraScreen'; // Import CameraScreen

const Stack = createNativeStackNavigator();

function App() {
  return (
  <>

    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Strona powitalna" component={Home} />
        <Stack.Screen name="Książki" component={BookList} />
        <Stack.Screen name="Wypożyczenia" component={CheckOutList} />
        <Stack.Screen name="Kamera" component={CameraScreen} />
      </Stack.Navigator>
    </NavigationContainer></>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    color: "#841114"
  }
});

export default App;