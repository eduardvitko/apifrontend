import axios from 'axios';

// --- Створення та налаштування екземпляру Axios ---
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

// Перехоплювач для автоматичного додавання JWT токена
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Перехоплювач для глобальної обробки помилок авторизації
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            // Перенаправляємо на сторінку входу, якщо це не сторінка входу, щоб уникнути циклу
            if (window.location.pathname !== '/login') {
                window.location = '/login';
            }
        }
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


// --- 3. Категорії ---
// Публічні
export const fetchCategories = () => api.get('/api/categories/all');
// Адмінські
export const fetchAdminCategories = () => api.get('/api/admin/all/categories');
export const createCategory = (data) => api.post('/api/admin/create/category', data);
export const updateCategory = (id, data) => api.put(`/api/admin/update/category/${id}`, data);
export const deleteCategory = (id) => api.delete(`/api/admin/delete/category/${id}`);


// --- 4. Товари ---
// Публічні
export const fetchAllProducts = () => api.get('/api/products/all');
export const fetchProductsByCategory = (categoryId) => api.get(`/api/products/by-category/${categoryId}`);
// Адмінські
export const fetchAdminProducts = () => api.get('/api/admin/all/products');
export const createProduct = (productData) => api.post('/api/admin/create/product', productData);
export const updateProduct = (id, productData) => api.put(`/api/admin/update/product/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/api/admin/delete/product/${id}`);


// --- 5. Адреси ---
export const fetchUserAddresses = () => api.get('/api/addresses/my');
export const createAddress = (addressData) => api.post('/api/addresses/create/address', addressData);


// --- 6. Замовлення (Orders) ---
export const fetchMyOrders = () => api.get('/api/orders/my');
export const fetchOrderById = (orderId) => api.get(`/api/orders/${orderId}`);
export const createOrder = (orderData) => api.post('/api/orders/create', orderData);
export const cancelOrder = (orderId) => api.put(`/api/orders/${orderId}/cancel`);
export const deleteOrder = (orderId) => api.delete(`/api/orders/delete/${orderId}`);
export const markOrderAsPaid = (orderId) => api.put(`/api/orders/${orderId}/pay`);
export const updateOrderAddress = (orderId, addressId) => api.put(`/api/orders/${orderId}/address/${addressId}`);
// Адмінські
export const fetchAllOrdersAdmin = () => api.get('/api/admin/orders');
export const fetchAllOrdersWithAddressAdmin = () => api.get('/api/orders/all/with-address');


// --- 7. Платежі (Payments) ---
export const fetchMyPayments = () => api.get('/api/payments/my');
export const createPayment = (paymentData) => api.post('/api/payments', paymentData);
export const updatePayment = (paymentId, paymentData) => api.put(`/api/payments/${paymentId}`, paymentData);
export const deletePayment = (paymentId) => api.delete(`/api/payments/${paymentId}`);


export default api;