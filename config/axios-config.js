// axios-config.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://chabowsk-pamiw-api-0f97b1d43830.herokuapp.com/api', // Bazowy URL Twojego backendu
});

export default instance;
