import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner, Alert, Table, Image, Card, Form } from 'react-bootstrap';

// 1. ІМПОРТУЄМО ТАКОЖ ФУНКЦІЮ ДЛЯ ОТРИМАННЯ КАТЕГОРІЙ
import { fetchAdminProducts, deleteProduct, fetchAdminCategories } from '../api';

const AllProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // <-- Новий стан для категорій
    const [selectedCategoryId, setSelectedCategoryId] = useState(''); // <-- Новий стан для вибраної категорії
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Функція для отримання товарів - без змін
    const fetchProducts = useCallback(async () => {
        // ... (код залишається без змін)
    }, []);

    // 2. ДОДАЄМО ФУНКЦІЮ ДЛЯ ЗАВАНТАЖЕННЯ КАТЕГОРІЙ
    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Завантажуємо і товари, і категорії одночасно
            const [productsResponse, categoriesResponse] = await Promise.all([
                fetchAdminProducts(),
                fetchAdminCategories()
            ]);
            setProducts(productsResponse.data);
            setCategories(categoriesResponse.data);
        } catch (e) {
            console.error("Помилка при завантаженні даних:", e);
            setError(e.response?.data?.message || 'Не вдалося завантажити дані.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Функції видалення та редагування - без змін
    const handleDelete = useCallback(async (id) => { /* ... */ }, [loadData]);
    const handleEdit = useCallback((id) => { /* ... */ }, [navigate]);

    // 3. ОНОВЛЮЄМО ФУНКЦІЮ СТВОРЕННЯ
    const handleCreate = (categoryId = null) => {
        if (categoryId) {
            // Якщо категорію вибрано, передаємо її ID на сторінку створення
            navigate('/admin/products/create', { state: { categoryId: categoryId } });
        } else {
            // Інакше просто переходимо
            navigate('/admin/products/create');
        }
    };

    // --- JSX-розмітка з новим блоком ---

    if (loading) { /* ... */ }
    if (error) { /* ... */ }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h2>Керування товарами</h2>
                {/* Загальна кнопка створення */}
                <Button variant="success" onClick={() => handleCreate()}>
                    + Створити новий товар
                </Button>
            </div>

            {/* 4. НОВИЙ БЛОК ДЛЯ СТВОРЕННЯ ПО КАТЕГОРІЇ */}
            <Card className="mb-4">
                <Card.Header>Створити товар у конкретній категорії</Card.Header>
                <Card.Body>
                    <Form.Group controlId="categorySelect">
                        <Form.Label>Спочатку виберіть категорію:</Form.Label>
                        <Form.Select
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                        >
                            <option value="">-- Оберіть категорію --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Button
                        variant="primary"
                        className="mt-3"
                        onClick={() => handleCreate(selectedCategoryId)}
                        disabled={!selectedCategoryId} // Кнопка неактивна, поки не вибрано категорію
                    >
                        Перейти до створення
                    </Button>
                </Card.Body>
            </Card>

            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/admin')} className="mb-3">
                ← Назад до панелі адміністратора
            </Button>

            {products.length === 0 ? (
                <div className="text-center p-5 border rounded bg-light">
                    <p className="lead">Товари не знайдені.</p>
                </div>
            ) : (
                <Table striped bordered hover responsive="sm" className="align-middle">
                    {/* ... ваша таблиця без змін ... */}
                </Table>
            )}
        </div>
    );
};

export default AllProductsPage;