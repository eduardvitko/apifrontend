import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwt'); // виправлено з 'token'
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    const goToAllUsers = () => navigate('/admin/users');
    const goToAllCategories = () => navigate('/admin/categories');
    const goToAllProducts = () => navigate('/admin/products');
    const goToImages = () => navigate('/admin/images');
    const goToAddressOrders = () => navigate('/admin/orders/{id}/pay'); // нова функція

    return (
        <div className="container mt-5">
            <div className="card shadow">
                <div className="card-header bg-dark text-white">
                    <h4>Адмін-панель</h4>
                </div>
                <div className="card-body">
                    <p>Вітаємо, Адміністраторе!</p>

                    <div className="d-grid gap-3">
                        <button onClick={goToAllUsers} className="btn btn-primary">
                            Переглянути всіх користувачів
                        </button>

                        <button onClick={goToAllCategories} className="btn btn-secondary">
                            Категорії
                        </button>

                        <button onClick={goToAllProducts} className="btn btn-success">
                            Всі товари
                        </button>

                        <button onClick={goToImages} className="btn btn-warning">
                            Зображення
                        </button>

                        <button onClick={goToAddressOrders} className="btn btn-info">
                            Адреси та замовлення
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
