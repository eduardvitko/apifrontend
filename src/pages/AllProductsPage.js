import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner, Alert, Table, Image, Card, Form } from 'react-bootstrap';

// 1. ІМПОРТУЄМО всі потрібні функції
import { fetchAdminProducts, deleteProduct, fetchAdminCategories } from '../api';

const AllProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 2. ЄДИНА ФУНКЦІЯ для завантаження всіх потрібних даних
    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Завантажуємо і товари, і категорії одночасно для ефективності
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

    // 3. ВИПРАВЛЕНИЙ useEffect з перевіркою токена
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Доступ заборонено. Будь ласка, увійдіть як адміністратор.');
            setLoading(false);
            navigate('/admin/login');
            return;
        }
        loadData();
    }, [loadData, navigate]);

    // 4. ПОВНІСТЮ реалізовані функції дій
    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Ви дійсно хочете видалити цей товар?')) return;
        try {
            await deleteProduct(id);
            loadData(); // Перезавантажуємо всі дані після видалення
        } catch (e) {
            setError(e.response?.data?.message || 'Помилка при видаленні товару.');
        }
    }, [loadData]);

    const handleEdit = useCallback((id) => {
        navigate(`/admin/products/update/${id}`);
    }, [navigate]);

    const handleCreate = (categoryId = null) => {
        if (categoryId) {
            navigate('/admin/products/create', { state: { categoryId: categoryId } });
        } else {
            navigate('/admin/products/create');
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Завантаження даних...</p>
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
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h2>Керування товарами</h2>
                <Button variant="success" onClick={() => handleCreate()}>
                    + Створити новий товар
                </Button>
            </div>

            {/*<Card className="mb-4 shadow-sm">*/}
            {/*    <Card.Header as="h5">Створити товар у конкретній категорії</Card.Header>*/}
            {/*    <Card.Body>*/}
            {/*        <Form.Group controlId="categorySelect">*/}
            {/*            <Form.Label>Спочатку виберіть категорію:</Form.Label>*/}
            {/*            <Form.Select*/}
            {/*                value={selectedCategoryId}*/}
            {/*                onChange={(e) => setSelectedCategoryId(e.target.value)}*/}
            {/*            >*/}
            {/*                <option value="">-- Оберіть категорію --</option>*/}
            {/*                {categories.map(cat => (*/}
            {/*                    <option key={cat.id} value={cat.id}>{cat.name}</option>*/}
            {/*                ))}*/}
            {/*            </Form.Select>*/}
            {/*        </Form.Group>*/}
            {/*        <Button*/}
            {/*            variant="primary"*/}
            {/*            className="mt-3"*/}
            {/*            onClick={() => handleCreate(selectedCategoryId)}*/}
            {/*            disabled={!selectedCategoryId}*/}
            {/*        >*/}
            {/*            Перейти до створення*/}
            {/*        </Button>*/}
            {/*    </Card.Body>*/}
            {/*</Card>*/}

            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/admin')} className="mb-3">
                ← Назад до панелі адміністратора
            </Button>

            {products.length === 0 ? (
                <div className="text-center p-5 border rounded bg-light">
                    <p className="lead">Товари не знайдені.</p>
                    <p>Схоже, у базі даних ще немає жодного товару.</p>
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
                                    <Image src={prod.images[0].url} alt={prod.name} rounded style={{ width: '70px', height: '70px', objectFit: 'cover' }} />
                                ) : (
                                    <span className="text-muted small">Немає фото</span>
                                )}
                            </td>
                            <td>{prod.name}</td>
                            <td>{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(prod.price)}</td>
                            <td>{prod.stock}</td>
                            <td>{prod.categoryName}</td>
                            <td className="text-center">
                                <Button variant="primary" size="sm" className="me-2" onClick={() => handleEdit(prod.id)}>Редагувати</Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(prod.id)}>Видалити</Button>
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