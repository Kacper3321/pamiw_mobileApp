import React, { Component } from 'react';
import { View, Text, Button, ScrollView, TextInput,TouchableOpacity, StyleSheet} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from '../config/axios-config';
import { useNavigation } from '@react-navigation/native';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

class BookList extends Component {
    constructor() {
        super();
                this.state = {
                    books: [],
                    selectedBookId: '',
                    editingId: null,
                    isEditing: null,
                    currentPage: 1,
                    itemsPerPage: 2,
                    newBook: {
                        title: '',
                        author: '',
                        year: '',
                    },
                    isFormVisible: false,
                };
    }


     getCurrentBooks() {
             const {currentPage, itemsPerPage, books} = this.state;
             const indexOfLastItem = currentPage * itemsPerPage;
             const indexOfFirstItem = indexOfLastItem - itemsPerPage;
             return books.slice(indexOfFirstItem, indexOfLastItem);
         }

         componentDidMount() {
             // Pobierz listę książek z backendu po załadowaniu komponentu
             this.fetchBooks();
         }

         fetchBooks() {
             axios
                 .get('/books')
                 .then((response) => {
                     console.log('Odpowiedź z serwera:', response.data);
                     const sortedBooks = response.data.sort((a, b) => a.id - b.id);
                     this.setState({books: sortedBooks});
                 })
                 .catch((error) => {
                     console.error('Błąd podczas pobierania danych:', error);
                 });
         }

         handleDeleteClick(id) {
             this.setState({isFormVisible: false});
             // Usuń książkę o określonym ID
             axios
                 .delete(`/books/${id}`)
                 .then(() => {
                     // Po usunięciu odśwież listę książek
                     this.fetchBooks();
                 })
                 .catch((error) => {
                     console.error('Błąd podczas usuwania danych:', error);
                 });
         }

         handleEditClick(id) {
             const {books} = this.state;
             const bookToEdit = books.find((book) => book.id === id);
             // Ustaw ID książki, którą chcesz edytować
             if (bookToEdit) {
                 this.setState({
                     editingId: id,
                     isEditing: id,
                     isFormVisible: false,
                     newBook: {
                         ...bookToEdit, // Skopiuj istniejące dane
                     },
                 });
             }
         }

         handleSaveClick() {
             const { editingId, newBook, books } = this.state;

             // Use the state's newBook for updated data
             axios
                 .put(`/books/${editingId}`, newBook)
                 .then(() => {
                     this.fetchBooks();
                     this.setState({ editingId: null, newBook: { title: '', author: '', year: '' } });
                 })
                 .catch((error) => {
                     console.error('Błąd podczas zapisywania danych:', error);
                 });
         }

         handleCancelClick() {
             // Anuluj edycję
             this.setState({editingId: null, isFormVisible: false});
         }

         handleInputChange(value, field) {
             // Obsługa zmiany wartości w formularzu
             this.setState({
                 newBook: {
                     ...this.state.newBook,
                     [field]: value,
                 },
             });
         }

         handleAddClick() {
             // Dodaj nową książkę
             axios
                 .post('/books', this.state.newBook)
                 .then(() => {
                     // Po dodaniu odśwież listę książek
                     this.fetchBooks();
                     // Zresetuj formularz
                     this.setState({
                         newBook: {
                             title: '',
                             author: '',
                             year: '',
                         },
                         isFormVisible: false,
                     });
                 })
                 .catch((error) => {
                     console.error('Błąd podczas dodawania danych:', error);
                 });
         }

         changePage(newPage) {
                 this.setState({ currentPage: newPage });
         }

         renderPageNumbers() {
                 const { currentPage, itemsPerPage, books } = this.state;
                 const totalPages = Math.ceil(books.length / itemsPerPage);

                 return (
                     <View style={styles.paginationContainer}>
                         <Button
                             title="&laquo; Poprzednia"
                             disabled={currentPage === 1}
                             onPress={() => this.changePage(currentPage - 1)}
                         />
                         <Text> Strona {currentPage} z {totalPages} </Text>
                         <Button
                             title="Nastepna &raquo;"
                             disabled={currentPage === totalPages}
                             onPress={() => this.changePage(currentPage + 1)}
                         />
                     </View>
                 );
             }

    dateFormat(checkOut) {
            return (checkOut.checkoutDate[2]+"-"+checkOut.checkoutDate[1]+"-"+checkOut.checkoutDate[0]);
    }

    renderHeading() {
            return (
                <View style={{ flexDirection: 'row', backgroundColor: '#28d49c', marginLeft: 0.73}}>
                    <Text style={styles.cellID}>ID</Text>
                    <Text style={styles.titleCell}>Tytuł</Text>
                    <Text style={styles.authorCell}>Autor</Text>
                    <Text style={styles.publicationYearCell}>Rok{"\n"}publikacji</Text>
                </View>
            )
    }

    renderBooks() {
        const { editingId, newBook, books } = this.state;
        const currentBooks = this.getCurrentBooks();

        return currentBooks.map((book) => (
            <View key={book.id} style={styles.row}>

                {editingId === book.id ? (
                    <View style={{ flex:1, flexDirection:"row" }}>
                        <Text style={styles.cellID}>{book.id}</Text>

                        <TextInput
                            style={styles.titleCell}
                            value={newBook.title}
                            onChangeText={(text) => this.handleInputChange(text, 'title')}
                        />

                        <TextInput
                            style={styles.authorCell}
                            value={newBook.author}
                            onChangeText={(text) => this.handleInputChange(text, 'author')}
                        />

                        <TextInput
                            style={styles.publicationYearCell}
                            value={newBook.year.toString()}
                            onChangeText={(text) => this.handleInputChange(text, 'year')}
                        />
                    </View>
                ) : (
                    <View style={{ flexDirection:"row" }}>
                        <Text style={styles.cellID}>{book.id}</Text>
                        <Text style={styles.titleCell}>{book.title}</Text>
                        <Text style={styles.authorCell}>{book.author}</Text>
                        <Text style={styles.publicationYearCell}>{book.year}</Text>
                    </View>
                )}

                <View style={styles.cell}>
                    {editingId === book.id ? (
                        <View>
                            <TouchableOpacity
                                onPress={() => this.handleSaveClick(book)}
                                style={[styles.button, {backgroundColor: '#68c444'}]}
                            >
                                <Text>Zapisz</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => this.handleCancelClick()}
                                style={[styles.button, {backgroundColor: '#7894d4'}]}
                            >
                                <Text>Anuluj</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <TouchableOpacity
                                onPress={() => this.handleEditClick(book.id)}
                                style={[styles.button, {backgroundColor: '#ff7c4c'}]}
                            >
                                <Text>Edytuj</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => this.handleDeleteClick(book.id)}
                                style={[styles.button, {backgroundColor: '#d83c3c'}]}
                            >
                                <Text>Usuń</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        ));
    }

        renderAddBookForm() {
            const { newBook } = this.state;
            return (
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        value={newBook.title}
                        onChangeText={(text) => this.handleInputChange(text, 'title')}
                        placeholder="Tytuł książki"
                    />

                    <TextInput
                        style={styles.input}
                        value={newBook.author}
                        onChangeText={(text) => this.handleInputChange(text, 'author')}
                        placeholder="Autor książki"
                    />

                    <TextInput
                        style={styles.input}
                        value={newBook.year}
                        onChangeText={(text) => this.handleInputChange(text, 'year')}
                        placeholder="Rok wydania"
                    />

                    <Button
                        title="Dodaj Książkę"
                        onPress={() => this.handleAddClick()}
                    />
                </View>
            );
        }

    render() {
    const { isFormVisible } = this.state;
        return (
            <ScrollView style={styles.container}>
                <TouchableOpacity style={[styles.button, {width:150, backgroundColor: "#28d49c", marginLeft: 0, marginBottom: 0}]}
                    onPress={() => this.props.navigation.navigate('Strona powitalna')}>
                    <Text>Strona główna</Text>
                </TouchableOpacity>
                <Text style={styles.header}>Lista Książek</Text>

                 {this.renderHeading()}
                <View style={styles.table}>
                    {this.renderBooks()}
                </View>
                {this.renderPageNumbers()}
                <TouchableOpacity style={[styles.button, {width:150, backgroundColor: "#28d49c", marginLeft: 10, marginBottom: 40}]}
                    onPress={() =>
                            this.setState({
                                isFormVisible: !this.state.isFormVisible,
                                newCheckOut: {
                                    checkoutDate: '',
                                    returnDays: '',
                                    borrowerFullName: '',
                                    bookId: '',
                                }
                            })
                        }>
                    <Text>Dodaj nowa książke</Text>
                </TouchableOpacity>
                {isFormVisible && this.renderAddBookForm()}

            </ScrollView>

        );
    }
}

const styles = StyleSheet.create({
    container: {
            flex: 1,
            backgroundColor: '#f5f5f5', // Tło aplikacji
        },
        header: {
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginVertical: 20,
            color: 'green', // Kolor nagłówka zgodnie z obrazkiem
        },
    table: {
        borderWidth: 1,
        borderColor: "black",
        marginBottom: 10,
    },
    row: {
           flexDirection: 'col',
           justifyContent: 'space-between',
           backgroundColor: 'white', // Białe tło dla wierszy
           borderBottomColor: 'black',
           borderBottomWidth: 1, // Czarna linia pomiędzy wierszami
           textAlign: 'center',
    },
    authorCell: {
           borderColor: 'black',
           borderWidth: 1,
           width: 90,
           padding: 6, // Odpowiednie padding dla komórek
           textAlign: 'center',
           textAlignVertical: 'center',
        },

    publicationYearCell: {
           borderColor: 'black',
           borderWidth: 1,
           width: 110,
           padding: 6, // Odpowiednie padding dla komórek
           textAlign: 'center',
           textAlignVertical: 'center',
        },

    cellID: {
       borderColor: 'black',
       borderWidth: 1,
       width: 50,
       textAlign: 'center',
       textAlignVertical: 'center',
    },

    titleCell: {
        borderColor: "black",
        borderWidth: 1,
        width: 120,
        textAlign: 'center',
        padding: 5,
        textAlignVertical: 'center',
    },

    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        marginVertical: 5,
        //width: 60,
    },
    picker: {
        borderWidth: 1,
        borderColor: 'gray',
        width: 90,
        textAlignVertical: 'center',
    },

    button: {
                paddingHorizontal: 15,
                paddingVertical: 10,
                margin: 5,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 5, // Zaokrąglenie rogów przycisków
                borderWidth: 1,
    },
    formContainer: {
            padding: 20,
            marginBottom: 20,
            backgroundColor: '#fff', // Możesz dostosować kolory zgodnie z potrzebami
    },
    paginationContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingVertical: 10,
    },
});

export default BookList;