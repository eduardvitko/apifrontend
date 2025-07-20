import axios from 'axios';

// Створюємо єдиний, централізований екземпляр Axios
const api = axios.create({
    // Беремо адресу бекенду зі змінних середовища
    baseURL: process.env.REACT_APP_API_URL
});

// // Додаємо "перехоплювач", який автоматично додає токен авторизації до кожного запиту
// api.interceptors.request.use(config => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

/* ================== API-функції ================== */

// --- Автентифікація ---
export const registerUser = (data) => api.post('/api/auth/register', data);
export const loginUser = (data) => api.post('/api/auth/login', data);

// --- Категорії ---
export const fetchCategories = () => api.get('/api/categories/all');

// --- Товари ---
// export const fetchProducts = () => api.get('/api/products/all'); // приклад

// Додайте тут решту ваших функцій, завжди використовуючи екземпляр 'api'
// і вказуючи повний шлях, що починається з "/api/..."

export default api;