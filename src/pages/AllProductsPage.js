import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner, Alert, Table, Image } from 'react-bootstrap'; // Використовуємо компоненти Bootstrap

// 1. ІМПОРТУЄМО наші централізовані адмінські функції
import { fetchAdminProducts, deleteProduct } from '../api';

const AllProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 2. ФУНКЦІЯ для отримання товарів використовує fetchAdminProducts
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Запит автоматично отримає правильний baseURL і токен
            const response = await fetchAdminProducts();
            setProducts(response.data);
        } catch (e) {
            console.error("Помилка при завантаженні товарів:", e);
            // Глобальний перехоплювач в api.js обробить помилки авторизації
            setError(e.response?.data?.message || 'Не вдалося завантажити товари.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // 3. ФУНКЦІЯ видалення використовує deleteProduct
    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Ви дійсно хочете видалити цей товар?')) {
            return;
        }
        try {
            await deleteProduct(id);
            // Після успішного видалення оновлюємо список товарів
            fetchProducts();
        } catch (e) {
            console.error("Помилка при видаленні товару:", e);
            setError(e.response?.data?.message || 'Помилка при видаленні товару.');
        }
    }, [fetchProducts]);

    // Функції навігації залишаються без змін
    const handleEdit = useCallback((id) => {
        navigate(`/admin/products/update/${id}`);
    }, [navigate]);

    const handleCreate = useCallback(() => {
        navigate('/admin/products/create');
    }, [navigate]);

    // --- JSX-розмітка з покращеннями ---

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Завантаження товарів...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="secondary" onClick={() => navigate('/admin')}>
                    ← Назад до панелі адміністратора
                </Button>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Керування товарами</h2>
                <Button variant="success" onClick={handleCreate}>
                    + Створити товар
                </Button>
            </div>

            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/admin')} className="mb-3">
                ← Назад до панелі адміністратора
            </Button>

            {products.length === 0 ? (
                <div className="text-center p-5 border rounded bg-light">
                    <p className="lead">Товари не знайдені.</p>
                    <p>Схоже, у базі даних ще немає жодного товару. Створіть перший!</p>
                </div>
            ) : (
                <Table striped bordered hover responsive="sm" className="align-middle">
                    <thead className="table-dark">
                    <tr>
                        <th style={{ width: '100px' }}>Зображення</th>
                        <th>Назва</th>
                        <th>Ціна</th>
                        <th>Залишок</th>
                        <th>Категорія</th>
                        <th style={{ width: '200px', textAlign: 'center' }}>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map(prod => (
                        <tr key={prod.id}>
                            <td className="text-center">
                                {prod.images && prod.images.length > 0 && prod.images[0].url ? (
                                    <Image
                                        src={prod.images[0].url}
                                        alt={prod.images[0].altText || prod.name}
                                        rounded
                                        style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/70x70?text=Error';
                                            e.target.alt = 'Зображення не завантажено';
                                        }}
                                    />
                                ) : (
                                    <span className="text-muted small">Немає фото</span>
                                )}
                            </td>
                            <td>{prod.name}</td>
                            <td>{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(prod.price)}</td>
                            <td>{prod.stock}</td>
                            <td>{prod.categoryName}</td>
                            <td className="text-center">
                                <Button variant="primary" size="sm" className="me-2" onClick={() => handleEdit(prod.id)}>
                                    Редагувати
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(prod.id)}>
                                    Видалити
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default AllProductsPage;