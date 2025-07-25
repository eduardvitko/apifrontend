import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. ІМПОРТУЄМО нашу готову функцію з центрального файлу api.js
//    (Переконайтесь, що шлях до файлу правильний відносно цього компонента)
import { fetchUserProfile } from '../api'; // Якщо api.js лежить на рівень вище

const AdminPage = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 2. ВИКОРИСТОВУЄМО ОДНАКОВИЙ КЛЮЧ для токена, як і в api.js
        const token = localStorage.getItem('token');
        if (!token) {
            // Якщо токена немає, одразу перенаправляємо на сторінку входу
            navigate('/admin/login');
            return;
        }

        // 3. ВИКОРИСТОВУЄМО централізовану функцію.
        //    Вона сама підставить правильну адресу сервера (baseURL) і додасть токен.
        fetchUserProfile()
            .then(res => {
                // Успішно отримали дані користувача, зберігаємо його ID
                setUserId(res.data.id);
            })
            .catch((error) => {
                // Цей блок спрацює, якщо токен є, але він недійсний (прострочений або невірний)
                console.error("Помилка авторизації:", error); // Додаємо лог для налагодження
                alert('Не вдалося отримати дані користувача. Будь ласка, увійдіть повторно.');

                // Видаляємо недійсний токен і перенаправляємо на логін
                localStorage.removeItem('token');
                navigate('/admin/login');
            })
            .finally(() => {
                // У будь-якому випадку прибираємо індикатор завантаження
                setLoading(false);
            });
    }, [navigate]);

    // Функції для навігації (залишаються без змін, вони написані добре)
    const goToAllUsers = () => navigate('/admin/users');
    const goToAllCategories = () => navigate('/admin/categories');
    const goToAllProducts = () => navigate('/admin/products');
    const goToImages = () => navigate('/admin/images');
    const goToAddressOrders = () => navigate(`/admin/orders`);

    // Поки йде перевірка токена, показуємо екран завантаження
    if (loading) {
        return <div className="container mt-5 text-center"><h5>Завантаження...</h5></div>;
    }

    // Якщо завантаження завершено, показуємо адмін-панель
    return (
        <div className="container mt-5">
            <div className="card shadow-lg">
                <div className="card-header bg-dark text-white">
                    <h4 className="mb-0">Адмін-панель</h4>
                </div>
                <div className="card-body">
                    <p className="lead">Вітаємо, Адміністраторе! (Ваш ID: {userId})</p>

                    <div className="d-grid gap-3 mt-4">
                        <button onClick={goToAllUsers} className="btn btn-primary btn-lg">
                            Переглянути всіх користувачів
                        </button>

                        <button onClick={goToAllCategories} className="btn btn-secondary btn-lg">
                            Категорії
                        </button>

                        <button onClick={goToAllProducts} className="btn btn-success btn-lg">
                            Всі товари
                        </button>

                        <button onClick={goToImages} className="btn btn-warning btn-lg">
                            Зображення
                        </button>

                        <button onClick={goToAddressOrders} className="btn btn-info btn-lg">
                            Адреси та замовлення
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;