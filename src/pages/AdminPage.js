import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminPage = () => {
    const navigate = useNavigate();
    console.log("AdminPage rendered");

    const goToAllUsers = () => {
        navigate('/admin/users');
    };

    const goToAllCategories = () => {
        navigate('/admin/categories');
    };

    const goToAllProducts = () => {
        navigate('/admin/products'); // <-- цей маршрут має вести на AllProductsPage
    };

    return (
        <div className="container mt-5">
            <div className="card shadow">
                <div className="card-header bg-dark text-white">
                    <h4>Адмін-панель</h4>
                </div>
                <div className="card-body">
                    <p>Вітаємо, Адміністраторе!</p>

                    <button onClick={goToAllUsers} className="btn btn-primary mb-2">
                        Переглянути всіх користувачів
                    </button>
                    <br />

                    <button onClick={goToAllCategories} className="btn btn-secondary mb-2">
                        Категорії
                    </button>
                    <br />

                    <button onClick={goToAllProducts} className="btn btn-success">
                        Всі товари
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
