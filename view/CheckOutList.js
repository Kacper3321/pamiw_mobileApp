import React, { Component } from 'react';
import { View, Text, Button, ScrollView, TextInput,TouchableOpacity, StyleSheet} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from '../config/axios-config';
import { useNavigation } from '@react-navigation/native';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

class CheckOutList extends Component {
    constructor() {
        super();
        this.state = {
            checkOuts: [],
            sortedCheckOuts: [],
            books: [],
            selectedBookId: '',
            editingId: null,
            isEditing: null,
            currentPage: 1,
            itemsPerPage: 2,
            newCheckOut: {
                checkoutDate: '',
                returnDays: '',
                borrowerFullName: '',
                bookTitle: '', // Dodaje pole bookTitle
                editedReturnDays: '', // Dodaje pole editedReturnDays
                editedBorrowerFullName: '', // Dodaje pole editedBorrowerFullName
            },
            isFormVisible: false,
        };
    }


     getCurrentCheckOuts() {
        const { currentPage, itemsPerPage, sortedCheckOuts } = this.state;
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return sortedCheckOuts.slice(indexOfFirstItem, indexOfLastItem);
    }

    componentDidMount() {
        // Pobieram listę wypożyczeń z backendu po załadowaniu komponentu
        this.fetchCheckOuts();

        axios
            .get('/books')
            .then((response) => {
                this.setState({ books: response.data });
            })
            .catch((error) => {
                console.error('Błąd podczas pobierania danych:', error);
            });
    }

    fetchCheckOuts() {
        axios
            .get('/checkouts')
            .then((response) => {
                console.log('Odpowiedź z serwera:', response.data);
                const sortedCheckOuts = [...response.data].sort((a, b) => a.id - b.id);
                this.setState({ checkOuts: response.data, sortedCheckOuts });
            })
            .catch((error) => {
                console.error('Błąd podczas pobierania danych:', error);
            });
    }

    handleDeleteClick(id) {
        this.setState({isFormVisible: false});
        // Usuwam wpis o podanym ID
        axios
            .delete(`/checkouts/${id}`)
            .then(() => {
                // Po usunięciu odświeżam listę wypożyczeń
                this.fetchCheckOuts();
            })
            .catch((error) => {
                console.error('Błąd podczas usuwania danych:', error);
            });
    }

    handleEditClick(id) {
        const { checkOuts } = this.state;
        const checkOutToEdit = checkOuts.find(checkOut => checkOut.id === id);
        // Ustawiam ID wpisu, który chce edytować
        if (checkOutToEdit) {
            this.setState({
                editingId: id,
                isEditing: id,
                isFormVisible: false,
                newCheckOut: {
                    ...checkOutToEdit, // Kopiuje istniejące dane
                    editedReturnDays: checkOutToEdit.returnDays, // Ustawiam wartość początkową
                    editedBorrowerFullName: checkOutToEdit.borrowerFullName, // Ustawiam wartość początkową
                },
            });
        }
    }

    handleSaveClick(checkOut) {
        const { editedReturnDays, editedBorrowerFullName, ...rest } = this.state.newCheckOut;
        const updatedCheckOut = { ...checkOut, returnDays: editedReturnDays, borrowerFullName: editedBorrowerFullName, ...rest };
        // aktualizuje wpis o określonym ID
        axios
            .put(`/checkouts/${updatedCheckOut.id}`, updatedCheckOut)
            .then(() => {
                this.fetchCheckOuts();
                this.setState({ editingId: null });
            })
            .catch((error) => {
                console.error('Błąd podczas zapisywania danych:', error);
            });
    }

    handleCancelClick() {
        // Anuluje edycję
        this.setState({editingId: null,isFormVisible: false});
    }


    handleInputChange(value, field) {
        // Obsługa zmiany wartości w formularzu
        const { newCheckOut } = this.state;
        if (field === 'bookId') {
            this.setState({
                newCheckOut: {
                    ...newCheckOut,
                    [field]: value,
                },
                selectedBookId: value, // Ustawiam nowa wartosc dla selectedBookId
            });
        } else {
            this.setState({
                newCheckOut: {
                    ...newCheckOut,
                    [field]: value,
                },
            });
        }
    }

    handleAddClick() {
        // Dodaje nowy wpis
        axios
            .post('/checkouts', this.state.newCheckOut)
            .then(() => {
                // Po dodaniu odświeżam listę wypożyczeń
                this.fetchCheckOuts();
                // Resetuje formularz
                this.setState({
                    newCheckOut: {
                        bookId: '',
                        returnDays: '',
                        borrowerFullName: '',
                    },
                    isFormVisible: false,
                });
            })
            .catch((error) => {
                console.error('Błąd podczas dodawania danych:', error);
            });
    }

    changePage = (newPage) => {
            this.setState({ currentPage: newPage });
    }

     renderPageNumbers = () => {
            const { currentPage, itemsPerPage, sortedCheckOuts } = this.state;
            const totalPages = Math.ceil(sortedCheckOuts.length / itemsPerPage);

            return (
                <View style={styles.paginationContainer}>
                    <Button
                        title="&laquo; Poprzednia"
                        disabled={currentPage === 1}
                        onPress={() => this.changePage(currentPage - 1)}
                    />
                    <Text style={styles.paginationText}> Strona {currentPage} z {totalPages} </Text>
                    <Button
                        title="Następna &raquo;"
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
                <Text style={styles.dateCell}>Data</Text>
                <Text style={styles.loanPeriodCell}>Liczba{"\n"}dni</Text>
                <Text style={styles.cell1}>Osoba{"\n"}wypożyczająca</Text>
            </View>
    )}

    renderCheckOuts() {
        const { editingId, newCheckOut, books } = this.state;
                const currentCheckOuts = this.getCurrentCheckOuts();

                return currentCheckOuts.map((checkOut) => (
                    <View key={checkOut.id} style={styles.row}>

                        {editingId === checkOut.id ? (
                            <View style={{ flex:1,flexDirection:"row"}}>
                                <Text style={styles.cellID}>{checkOut.id}</Text>
                                <Picker
                                    selectedValue={newCheckOut.bookId}
                                    onValueChange={(itemValue) => this.handleInputChange(itemValue, 'bookId')}
                                    style={styles.titleCell}
                                >
                                    <Picker.Item label="Wybierz książkę" value="" />
                                    {books.map((book) => (
                                        <Picker.Item key={book.id} label={book.title} value={book.id} />
                                    ))}
                                </Picker>

                                <Text style={styles.dateCell}>{this.dateFormat(checkOut)}</Text>

                                <TextInput
                                    style={styles.loanPeriodCell}
                                    value={newCheckOut.returnDays.toString()}
                                    onChangeText={(text) => this.handleInputChange(text, 'returnDays')}
                                />

                                <TextInput
                                    style={styles.cell1}
                                    value={newCheckOut.borrowerFullName}
                                    onChangeText={(text) => this.handleInputChange(text, 'borrowerFullName')}
                                />
                            </View>
                        ) : (
                            <View style={{ flexDirection:"row" }}>
                                <Text style={styles.cellID}>{checkOut.id}</Text>
                                <Text style={styles.titleCell}>{checkOut.book.title}</Text>
                                <Text style={styles.dateCell}>{this.dateFormat(checkOut)}</Text>
                                <Text style={styles.loanPeriodCell}>{checkOut.returnDays}</Text>
                                <Text style={styles.cell1}>{checkOut.borrowerFullName}</Text>
                            </View>
                        )}
                            <View style={styles.cell}>
                            {editingId === checkOut.id ? (
                            <View>
                                <TouchableOpacity
                                    onPress={() => this.handleSaveClick(checkOut)}
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
                                    onPress={() => this.handleEditClick(checkOut.id)}
                                    style={[styles.button, {backgroundColor: '#ff7c4c'}]}
                                >
                                    <Text>Edytuj</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => this.handleDeleteClick(checkOut.id)}
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

    renderAddCheckOutForm() {
            const { newCheckOut, books } = this.state;
            return (
                <View style={styles.formContainer}>
                    <Picker
                        selectedValue={newCheckOut.bookId}
                        onValueChange={(itemValue) => this.handleInputChange(itemValue, 'bookId')}
                    >
                        <Picker.Item label="Wybierz książkę" value="" />
                        {books.map((book) => (
                            <Picker.Item key={book.id} label={book.title} value={book.id} />
                        ))}
                    </Picker>

                    <TextInput
                        style={styles.input}
                        value={newCheckOut.returnDays}
                        onChangeText={(text) => this.handleInputChange(text, 'returnDays')}
                        placeholder="Liczba dni"
                    />

                    <TextInput
                        style={styles.input}
                        value={newCheckOut.borrowerFullName}
                        onChangeText={(text) => this.handleInputChange(text, 'borrowerFullName')}
                        placeholder="Imię i nazwisko wypożyczającego"
                    />

                    <Button
                        title="Dodaj Wypożyczenie"
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
                <Text style={styles.header}>Lista Wypożyczeń</Text>

                 {this.renderHeading()}
                <View style={styles.table}>
                    {this.renderCheckOuts()}
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
                    <Text>Dodaj nowy wpis</Text>
                </TouchableOpacity>
                {isFormVisible && this.renderAddCheckOutForm()}
                {this.renderPageNumbers}
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
    cell1: {
       borderColor: 'black',
       borderWidth: 1,
       width: 110,
       padding: 6, // Odpowiednie padding dla komórek
       textAlign: 'center',
       textAlignVertical: 'center',
    },
    dateCell: {
           borderColor: 'black',
           borderWidth: 1,
           width: 80,
           padding: 6, // Odpowiednie padding dla komórek
           textAlign: 'center',
           textAlignVertical: 'center',
        },

    loanPeriodCell: {
           borderColor: 'black',
           borderWidth: 1,
           width: 60,
           padding: 6, // Odpowiednie padding dla komórek
           textAlign: 'center',
           textAlignVertical: 'center',
        },

    cellID: {
       borderColor: 'black',
       borderWidth: 1,
       width: 25,
       textAlign: 'center',
       textAlignVertical: 'center',
    },

    titleCell: {
        borderColor: "black",
        borderWidth: 1,
        width: 90,
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
        paginationText: {
            fontSize: 16,
    },
});

export default CheckOutList;