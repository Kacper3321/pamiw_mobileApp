import React from 'react';
import { View, Text, StyleSheet, Pressable  } from 'react-native';
// Zaimportuj odpowiednie komponenty z React Navigation
import { useNavigation } from '@react-navigation/native';

function Button(props) {
  const { onPress, title = 'Save' } = props;
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

function Home() {
    const navigation = useNavigation();

    return (<>
        <View style={styles.centerContent}>
            <Text style={styles.header}>Witaj!</Text>
            <View style={styles.buttonContainer}>
                <Button
                    style={styles.button}
                    title="Pokaż listę książek"

                    onPress={() => navigation.navigate('Książki')} // Zaktualizuj nazwę ścieżki
                />
                <Button
                    title="Pokaż listę wypożyczeń"
                    onPress={() => navigation.navigate('Wypożyczenia')} // Zaktualizuj nazwę ścieżki
                />
                <Button
                      title="Przejdź do kamery"
                      onPress={() => navigation.navigate('Kamera')} // Zaktualizuj nazwę ścieżki
                  />
            </View>
        </View>
        </>
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
        alignItems: 'center'
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#23d399',
        width: 152,
        border: '#000000',
        height: 60,
        borderWidth: 1,
        borderColor: '#000'
    }
 });

export default Home;
