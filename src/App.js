import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AllUsersPage from './pages/AllUsersPage';
import AllCategoriesPage from './pages/AllCategoriesPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AllProductsPage from './pages/AllProductsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CreateProductPage from './pages/CreateProductPage';
import UpdateProductPage from './pages/UpdateProductPage';
import CategoryProductsPage from './pages/CategoryProductsPage';
import OrdersPage from './pages/OrdersPage';
import CreateOrderPage from './pages/CreateOrderPage';
import CartPage from './pages/CartPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import PaymentPage from './pages/PaymentPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ImagePage from './pages/ImagePage';
import ProductDetailsPage from './pages/ProductDetailsPage';

import Navbar from './pages/Navbar'; // компонент навігації з пошуком


const HomePage = () => (
    <div className="container mt-5">
        <h1>Ласкаво просимо до магазину!</h1>
        <p>Оберіть категорію або увійдіть у свій профіль.</p>
    </div>
);

function App() {
    return (
        <Router>
            <Navbar />
            <div className="container mt-4">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin/users" element={<AllUsersPage />} />
                    <Route path="/allCategories" element={<AllCategoriesPage />} />
                    <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                    <Route path="/admin/products" element={<AllProductsPage />} />
                    <Route path="/admin/products/create" element={<CreateProductPage />} />
                    <Route path="/admin/products/update/:id" element={<UpdateProductPage />} />
                    <Route path="/categories/:id/products" element={<CategoryProductsPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/create" element={<CreateOrderPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
                    <Route path="/admin/images" element={<ImagePage />} />
                    <Route path="/products/all" element={<AllProductsPage />} />
                    {/* <Route path="/admin/images/:productId" element={<ImagePage />} /> */}
                    <Route path="/payments" element={<PaymentPage />} />
                    <Route path="/products/search" element={<SearchResultsPage />} />
                    <Route path="/products/:id" element={<ProductDetailsPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
