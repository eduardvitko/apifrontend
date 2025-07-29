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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/admin/login') {
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
// Публічні (з CategoryController)
export const fetchCategories = () => api.get('/api/categories/all');
// Адмінські (з AdminController)
export const fetchAdminCategories = () => api.get('/api/admin/all/categories');
export const createCategory = (data) => api.post('/api/admin/create/category', data);
export const updateCategory = (id, data) => api.put(`/api/admin/update/category/${id}`, data);
export const deleteCategory = (id) => api.delete(`/api/admin/delete/category/${id}`);


// --- 4. Товари ---
// Публічні (з ProductController)
export const fetchAllProducts = () => api.get('/api/products/all');
export const fetchProductsByCategory = (categoryId) => api.get(`/api/products/by-category/${categoryId}`);
// Адмінські (з AdminController)
export const createProduct = (productData) => api.post('/api/admin/create/product', productData);
export const fetchAdminProducts = () => api.get('/api/admin/all/products');
export const updateProduct = (id, productData) => api.put(`/api/admin/update/product/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/api/admin/delete/product/${id}`);


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