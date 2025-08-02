import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ↓↓↓ ОНОВЛЕНИЙ І БІЛЬШ "РОЗУМНИЙ" ПЕРЕХОПЛЮВАЧ ВІДПОВІДЕЙ ↓↓↓
api.interceptors.response.use(
    // Якщо відповідь успішна, просто повертаємо її
    (response) => response,

    // Якщо виникла помилка
    (error) => {
        // Перевіряємо, чи існує відповідь від сервера
        if (error.response) {
            // Вилогінюємо ТІЛЬКИ якщо сесія закінчилася (401 Unauthorized)
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                // Перенаправляємо на сторінку входу, щоб уникнути циклічних помилок
                if (window.location.pathname !== '/login' && window.location.pathname !== '/admin/login') {
                    // Можна додати сповіщення для користувача
                    alert("Ваша сесія закінчилася. Будь ласка, увійдіть знову.");
                    window.location = '/login';
                }
            }
            // Помилку 403 (і всі інші) ми НЕ обробляємо глобально,
            // а дозволяємо компонентам обробити її самостійно (показати повідомлення).
        }

        // Повертаємо помилку, щоб її можна було обробити в компоненті
        // (наприклад, у блоці catch, щоб встановити setError)
        return Promise.reject(error);
    }
);

/* ================================================================
   ======                   API-ФУНКЦІЇ                     ======
   ================================================================ */

// --- 1. Автентифікація ---
export const registerUser = (data) => api.post('/api/auth/register', data);
export const loginUser = (data) => api.post('/api/auth/login', data);
export const checkAuth = () => api.get('/api/auth/check');


// --- 2. Користувач ---
export const fetchUserProfile = () => api.get('/api/user/me');
export const fetchAllUsers = () => api.get('/api/admin/users');
export const updateUser = (userId, userData) => api.put(`/api/admin/update/${userId}`, userData);
export const deleteUser = (userId) => api.delete(`/api/admin/delete/${userId}`);

// --- 3. Категорії ---
// Публічні (з CategoryController)
export const fetchCategories = () => api.get('/api/categories/all');
// Адмінські (з AdminController)
export const fetchAdminCategories = () => api.get('/api/admin/all/categories');
export const createCategory = (data) => api.post('/api/admin/create/category', data);
export const updateCategory = (id, data) => api.put(`/api/admin/update/category/${id}`, data);
export const deleteCategory = (id) => api.delete(`/api/admin/delete/category/${id}`);
export const fetchAllImages = () => api.get('/api/images/all');
export const createImage = (imageData) => api.post('/api/images', imageData);
export const updateImage = (imageId, imageData) => api.put(`/api/images/update/${imageId}`, imageData);
export const deleteImage = (imageId) => api.delete(`/api/images/delete/${imageId}`);

// --- 4. Товари ---
// Публічні (з ProductController)
export const fetchAllProducts = () => api.get('/api/products/all');
export const fetchProductsByCategory = (categoryId) => api.get(`/api/products/by-category/${categoryId}`);
export const searchProducts = (query) => api.get(`/api/products/search?q=${query}`);
// Адмінські (з AdminController)
export const createProduct = (productData) => api.post('/api/admin/create/product', productData);
export const fetchAdminProducts = () => api.get('/api/admin/all/products');
export const updateProduct = (id, productData) => api.put(`/api/admin/update/product/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/api/admin/delete/product/${id}`);
export const fetchAdminProductById = (id) => api.get(`/api/admin/product/${id}`);

// --- 5. Адреси ---
// ВИКОРИСТОВУЄМО ІСНУЮЧИЙ ЕНДПОІНТ, ЩО ПРИЙМАЄ userId
export const fetchUserAddresses = (userId) => api.get(`/api/addresses/user/${userId}`);
export const createAddress = (addressData) => api.post('/api/addresses/create/address', addressData);


// --- 6. Замовлення (Orders) ---
export const createOrder = (orderData) => api.post('/api/orders/create', orderData);
// ВИКОРИСТОВУЄМО ІСНУЮЧИЙ ЕНДПОІНТ, ЩО ПРИЙМАЄ userId
export const fetchOrdersByUserId = (userId) => api.get(`/api/orders/user/${userId}`);
export const cancelOrder = (orderId) => api.put(`/api/orders/${orderId}/cancel`);
export const deleteOrder = (orderId) => api.delete(`/api/orders/delete/${orderId}`);
export const markOrderAsPaid = (orderId) => api.put(`/api/orders/${orderId}/pay`);
export const updateOrderAddress = (orderId, addressId) => api.put(`/api/orders/${orderId}/address/${addressId}`);
// Адмінські
export const fetchAllOrdersAdmin = () => api.get('/api/admin/orders');
export const fetchAllOrdersWithAddressAdmin = () => api.get('/api/orders/all/with-address');


// --- 7. Платежі (Payments) ---
export const createPayment = (paymentData) => api.post('/api/payments', paymentData);
export const updatePayment = (paymentId, paymentData) => api.put(`/api/payments/${paymentId}`, paymentData);
export const deletePayment = (paymentId) => api.delete(`/api/payments/${paymentId}`);
// УВАГА: У вас немає ендпоінта для отримання платежів користувача. Створюємо заглушку.
export const fetchUserPayments = (userId) => {
    console.warn("API endpoint to get payments by user ID does not exist. Returning empty array.");
    return Promise.resolve({ data: [] });
};


export default api;