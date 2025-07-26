import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';

// Імпортуємо ваші сторінки
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AllCategoriesPage from './pages/AllCategoriesPage';
import CategoryProductsPage from './pages/CategoryProductsPage';
import OrdersPage from './pages/OrdersPage';
import CreateOrderPage from './pages/CreateOrderPage';
import CartPage from './pages/CartPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import PaymentPage from './pages/PaymentPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';

// Імпортуємо адмінські сторінки
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AllUsersPage from './pages/AllUsersPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AllProductsPage from './pages/AllProductsPage'; // Перейменував для уникнення конфлікту
import CreateProductPage from './pages/CreateProductPage';
import UpdateProductPage from './pages/UpdateProductPage';
import ImagePage from './pages/ImagePage';
import AddressOrdersPage from "./pages/AddressOrdersPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";

// Імпортуємо компоненти
import Navbar from './pages/Navbar';
import AdminRoute from './AdminRoute'; // <-- НАШ НОВИЙ ЗАХИЩЕНИЙ МАРШРУТ


const HomePage = () => {
    const { t } = useTranslation();
    return (
        <div className="container mt-5">
            <h1>{t('home_welcome')}</h1>
            <p>{t('home_select_category')}</p>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Navbar />
            <div className="container mt-4">
                <Routes>
                    {/* --- ПУБЛІЧНІ МАРШРУТИ --- */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} /> {/* Залишаємо публічним */}
                    <Route path="/all/сategories" element={<AllCategoriesPage />} />
                    <Route path="/categories/:id/products" element={<CategoryProductsPage />} />
                    <Route path="/products/search" element={<SearchResultsPage />} />
                    <Route path="/products/:id" element={<ProductDetailsPage />} />
                    <Route path="/products/all" element={<AllProductsPage />} />

                    {/* --- МАРШРУТИ ДЛЯ АВТОРИЗОВАНИХ КОРИСТУВАЧІВ (БОНУС) --- */}
                    {/* Ви можете створити ProtectedRoute за аналогією з AdminRoute, але з перевіркою тільки наявності токену */}
                    {/* <Route element={<ProtectedRoute />}> */}
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/create" element={<CreateOrderPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
                    <Route path="/payments" element={<PaymentPage />} />
                    {/* </Route> */}


                    {/* --- АДМІНСЬКІ МАРШРУТИ (ЗАХИЩЕНІ) --- */}
                    <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/admin/users" element={<AllUsersPage />} />
                        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                        <Route path="/admin/products" element={<AllProductsPage />} />
                        <Route path="/admin/products/create" element={<CreateProductPage />} />
                        <Route path="/admin/products/update/:id" element={<UpdateProductPage />} />
                        <Route path="/admin/images" element={<ImagePage />} />
                        <Route path="/admin/orders" element={<AdminOrdersPage />} />
                        <Route path="/admin/orders/user/:userId/with-address" element={<AddressOrdersPage />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;