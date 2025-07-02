import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Рекомендовано: Винесіть API_BASE_URL в окремий конфігураційний файл
const API_BASE_URL = 'http://localhost:8080/api';

const AllProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Додатковий стан для підтвердження видалення, якщо ви захочете використовувати модальне вікно замість window.confirm
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const navigate = useNavigate();
    // Отримуємо JWT токен. УВАГА: Для продакшну використовуйте HttpOnly cookies!
    const token = localStorage.getItem('jwt');

    // Функція для отримання всіх товарів
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(''); // Очищаємо попередні помилки
        if (!token) {
            setError('Ви не авторизовані. Будь ласка, увійдіть.');
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/products/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (e) {
            console.error("Помилка при завантаженні товарів:", e);
            if (e.response && e.response.status === 401) {
                setError('Сесія закінчилася або ви не авторизовані. Будь ласка, увійдіть знову.');
                // navigate('/login'); // Можна перенаправити на сторінку входу
            } else {
                setError(e.response?.data?.message || 'Не вдалося завантажити товари.');
            }
        } finally {
            setLoading(false);
        }
    }, [token]); // Залежність: токен

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]); // Залежність: мемоізована функція fetchProducts

    // Функція видалення товару
    const handleDelete = useCallback(async (id) => {
        // УВАГА: Для кращого UX використовуйте кастомне модальне вікно замість window.confirm
        if (!window.confirm('Ви дійсно хочете видалити цей товар?')) {
            return;
        }
        try {
            await axios.delete(`${API_BASE_URL}/admin/delete/product/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Після успішного видалення оновлюємо список товарів
            fetchProducts();
            // alert('Товар успішно видалено!'); // УВАГА: Для кращого UX використовуйте toast-повідомлення
        } catch (e) {
            console.error("Помилка при видаленні товару:", e);
            // alert('Помилка при видаленні товару!'); // УВАГА: Для кращого UX використовуйте toast-повідомлення
            setError(e.response?.data?.message || 'Помилка при видаленні товару.');
        }
    }, [token, fetchProducts]); // Залежності: токен, fetchProducts

    // Функція редагування товару
    const handleEdit = useCallback((id) => {
        navigate(`/admin/products/update/${id}`);
    }, [navigate]);

    // Функція створення товару
    const handleCreate = useCallback(() => {
        navigate('/admin/products/create');
    }, [navigate]);

    // Функція керування зображеннями
    const handleManageImages = useCallback((productId) => {
        navigate(`/admin/images/${productId}`);
    }, [navigate]);

    return (
        <div className="container mt-5">
            <h2>Керування товарами</h2>
            <button className="btn btn-success mb-3" onClick={handleCreate}>
                Створити товар
            </button>

            {loading ? (
                <p className="text-center">Завантаження товарів...</p>
            ) : error ? (
                <p className="text-danger text-center">{error}</p>
            ) : products.length === 0 ? (
                <p className="text-center">Товари не знайдені.</p>
            ) : (
                <>
                    <table className="table table-striped table-bordered">
                        <thead>
                        <tr>
                            <th style={{ width: '100px' }}>Зображення</th>
                            <th>Назва</th>
                            <th>Ціна</th>
                            <th>Залишок</th>
                            <th>Категорія</th>
                            <th style={{ width: '250px' }}>Дії</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map(prod => (
                            <tr key={prod.id}>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    {/* --- Логіка відображення зображення --- */}
                                    {prod.images && prod.images.length > 0 && prod.images[0].url ? (
                                        <img
                                            src={prod.images[0].url}
                                            alt={prod.images[0].altText || prod.name}
                                            style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '5px' }}
                                            // --- Обробник помилок завантаження зображення ---
                                            onError={(e) => {
                                                e.target.onerror = null; // Запобігаємо нескінченному циклу
                                                e.target.src = 'https://via.placeholder.com/70x70?text=Error'; // URL заглушки при помилці
                                                e.target.alt = 'Зображення не завантажено'; // Оновлюємо alt-текст
                                            }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '0.8em', color: '#666' }}>Немає зображення</span>
                                    )}
                                </td>
                                <td style={{ verticalAlign: 'middle' }}>{prod.name}</td>
                                <td style={{ verticalAlign: 'middle' }}>{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(prod.price)}</td>
                                <td style={{ verticalAlign: 'middle' }}>{prod.stock}</td>
                                <td style={{ verticalAlign: 'middle' }}>{prod.categoryName}</td>
                                <td style={{ verticalAlign: 'middle' }}>
                                    <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(prod.id)}>
                                        Редагувати
                                    </button>
                                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleManageImages(prod.id)}>
                                        Зображення
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(prod.id)}>
                                        Видалити
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <button className="btn btn-secondary mb-3" onClick={() => navigate('/admin')}>
                        ← Назад до панелі адміністратора
                    </button>
                </>
            )}
        </div>
    );
};

export default AllProductsPage;