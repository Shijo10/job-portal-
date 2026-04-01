import axios from 'axios';

// Updated: Explicitly pointing to the computer's host Local IP address 
// to allow the Android physical device on the same Hotspot/Wi-Fi to connect to the Node.js backend.
export const BASE_URL = 'http://172.20.10.2:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
