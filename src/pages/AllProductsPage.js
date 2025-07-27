import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner, Alert, Table, Image } from 'react-bootstrap';

// Імпортуємо наші централізовані адмінські функції
import { fetchAdminProducts, deleteProduct } from '../api';

const AllProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetchAdminProducts();
            setProducts(response.data);
        } catch (e) {
            console.error("Помилка при завантаженні товарів:", e);
            setError(e.response?.data?.message || 'Не вдалося завантажити товари.');
        } finally {
            setLoading(false);
        }
    }, []);

    // ↓↓↓ ОСЬ КЛЮЧОВЕ ВИПРАВЛЕННЯ ↓↓↓
    useEffect(() => {
        // Спочатку перевіряємо, чи є токен.
        // Це гарантує, що ми не робимо зайвий запит, якщо користувач не увійшов.
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Доступ заборонено. Будь ласка, увійдіть як адміністратор.');
            setLoading(false);
            // Можна додати невелику затримку перед редіректом, щоб користувач встиг прочитати повідомлення
            setTimeout(() => navigate('/admin/login'), 2000);
            return; // Зупиняємо виконання, якщо токена немає
        }

        // Якщо токен є, викликаємо функцію завантаження товарів
        fetchProducts();
    }, [fetchProducts, navigate]); // navigate тепер є залежністю

    // Функція видалення тепер використовує deleteProduct
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
    }, [fetchProducts]);

    // Функції навігації залишаються без змін
    const handleEdit = useCallback((id) => {
        navigate(`/admin/products/update/${id}`);
    }, [navigate]);

    const handleCreate = useCallback(() => {
        navigate('/admin/products/create');
    }, [navigate]);

    // --- JSX-розмітка без змін ---
    // Вона написана чудово і не потребує правок

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
                    {/* ... ваша таблиця без змін ... */}
                    </thead>
                    <tbody>
                    {/* ... ваша таблиця без змін ... */}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default AllProductsPage;