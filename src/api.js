import axios from 'axios';

// Створюємо єдиний, централізований екземпляр Axios
const api = axios.create({
    // Беремо адресу бекенду зі змінних середовища
    baseURL: process.env.REACT_APP_API_URL // -> На Netlify це буде "https://internetstore.onrender.com"
});

// Додаємо "перехоплювач" (interceptor), який автоматично додає
// токен авторизації до кожного запиту, якщо він є.
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token'); // Важливо: ключ має бути саме 'token'
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


/* ================== API-функції ================== */
// Ми експортуємо кожну функцію окремо, щоб її можна було легко імпортувати в компонентах.

// --- Автентифікація ---
export const registerUser = (data) => api.post('/api/auth/register', data);
export const loginUser = (data) => api.post('/api/auth/login', data);
export const checkAuth = () => api.get('/api/auth/check');

// --- Користувач ---
export const fetchUserProfile = () => api.get('/api/user/me');

// --- Категорії ---
export const fetchCategories = () => api.get('/api/categories/all');

// --- Товари ---

// Функція для створення товару
export const createProduct = (productData) => api.post('/api/admin/create/product', productData);


export const fetchAdminProducts = () => api.get('/api/admin/all/products');
export const updateProduct = (id, productData) => api.put(`/api/admin/update/product/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/api/admin/delete/product/${id}`);










export const fetchAdminCategories = () => api.get('/api/admin/all/categories');

export const createCategory = (data) => api.post('/api/admin/create/category', data);

export const updateCategory = (id, data) => api.put(`/api/admin/update/category/${id}`, data);

export const deleteCategory = (id) => api.delete(`/api/admin/delete/category/${id}`);

// Експортуємо сам екземпляр 'api' на випадок, якщо він знадобиться для нестандартних запитів.
export default api;