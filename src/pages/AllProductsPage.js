import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. ІМПОРТУЄМО наші централізовані функції з api.js
import { fetchAdminProducts, deleteProduct } from '../api'; // У нас вже є ці функції в api.js!

const AllProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // 2. ФУНКЦІЯ для отримання товарів тепер використовує fetchAdminProducts
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Тепер запит автоматично отримає правильний baseURL і токен
            const response = await fetchAdminProducts();
            setProducts(response.data);
        } catch (e) {
            console.error("Помилка при завантаженні товарів:", e);
            setError(e.response?.data?.message || 'Не вдалося завантажити товари.');
            // Наш глобальний перехоплювач в api.js сам обробить помилку 401/403 і зробить редірект
        } finally {
            setLoading(false);
        }
    }, []); // Залежності більше не потрібні, бо функція не залежить від токена напряму

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // 3. ФУНКЦІЯ видалення тепер використовує deleteProduct
    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Ви дійсно хочете видалити цей товар?')) {
            return;
        }
        try {
            await deleteProduct(id);
            fetchProducts(); // Оновлюємо список
        } catch (e) {
            console.error("Помилка при видаленні товару:", e);
            setError(e.response?.data?.message || 'Помилка при видаленні товару.');
        }
    }, [fetchProducts]); // Залежність тільки від fetchProducts

    // Решта функцій навігації залишаються без змін
    const handleEdit = useCallback((id) => {
        navigate(`/admin/products/update/${id}`);
    }, [navigate]);

    const handleCreate = useCallback(() => {
        navigate('/admin/products/create');
    }, [navigate]);

    // JSX-розмітка залишається без змін, вона написана дуже добре

    return (
        <div className="container mt-5">
            <button className="btn btn-secondary mb-3" onClick={() => navigate('/admin')}>
                ← Назад до панелі адміністратора
            </button>
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
                <table className="table table-striped table-bordered">
                    {/* ... ваша таблиця без змін ... */}
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
                                {prod.images && prod.images.length > 0 && prod.images[0].url ? (
                                    <img
                                        src={prod.images[0].url}
                                        alt={prod.images[0].altText || prod.name}
                                        style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '5px' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/70x70?text=Error';
                                            e.target.alt = 'Зображення не завантажено';
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
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(prod.id)}>
                                    Видалити
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AllProductsPage;