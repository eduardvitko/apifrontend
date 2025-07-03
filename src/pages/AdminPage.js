import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    const goToAllUsers = () => {
        navigate('/admin/users');
    };

    const goToAllCategories = () => {
        navigate('/admin/categories');
    };

    const goToAllProducts = () => {
        navigate('/admin/products');
    };

    const goToImages = () => {
        navigate('/admin/images');
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

                    <button onClick={goToAllProducts} className="btn btn-success mb-2">
                        Всі товари
                    </button>
                    <br/>

                    <button onClick={goToImages} className="btn btn-warning mt-2">
                        Зображення
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
