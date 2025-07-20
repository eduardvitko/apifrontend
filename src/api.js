import axios from 'axios';

// const API = axios.create({
//     baseURL: 'http://localhost:8080/api',
// });
const API = axios.create({
    // Замінюємо статичну адресу на змінну середовища
    baseURL: process.env.REACT_APP_API_URL
});
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const fetchCategories = () => API.get('/categories/all');
