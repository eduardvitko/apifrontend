
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AllUsersPage from './pages/AllUsersPage';
import AllCategoriesPage from "./pages/AllCategoriesPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
// Если AllProductsPage.js лежит в src/pages/
import AllProductsPage from './pages/AllProductsPage';
import CreateProductPage from './pages/CreateProductPage';
import UpdateProductPage from './pages/UpdateProductPage';





function App() {
    return (
        <Router>
            <nav className="navbar navbar-expand navbar-dark bg-dark px-3">
                <Link className="navbar-brand" to="/">My Store</Link>
                <div className="navbar-nav">
                    <Link className="nav-link" to="/register">Register</Link>
                    <Link className="nav-link" to="/login">Login</Link>
                    <Link className="nav-link" to="/profile">Profile</Link>
                    <Link className="nav-link" to="/allCategories">Categories</Link>

                </div>
            </nav>

            <div className="container mt-4">
                <Routes>
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/users" element={<AllUsersPage />} />
                    <Route path="/allCategories" element={<AllCategoriesPage />} />
                    <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                    <Route path="/admin/products" element={<AllProductsPage />} />
                    <Route path="/admin/products/create" element={<CreateProductPage />} />
                    <Route path="/admin/products/update/:id" element={<UpdateProductPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
