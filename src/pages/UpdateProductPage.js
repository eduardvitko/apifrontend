import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';

// 1. ІМПОРТУЄМО наші централізовані функції
import { fetchAdminProductById, fetchAdminCategories, updateProduct } from '../api';

const UpdateProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Єдина функція для завантаження початкових даних
    const loadData = useCallback(async () => {
        if (!id) {
            navigate('/admin/products');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const [productRes, categoriesRes] = await Promise.all([
                fetchAdminProductById(id),
                fetchAdminCategories()
            ]);

            const productData = {
                ...productRes.data,
                // Важливо: categoryId може бути об'єктом, беремо з нього ID
                categoryId: productRes.data.category?.id || ''
            };
            setProduct(productData);
            setCategories(categoriesRes.data);
        } catch (err) {
            setError('Не вдалося завантажити дані. Товар або категорії не знайдено.');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Оновлений обробник відправки форми
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Готуємо дані, перетворюючи рядки на числа
            const dataToSend = {
                name: product.name,
                description: product.description,
                price: parseFloat(product.price),
                stock: parseInt(product.stock),
                categoryId: parseInt(product.categoryId)
            };

            await updateProduct(id, dataToSend);
            alert('Товар успішно оновлено!');
            navigate('/admin/products');
        } catch (err) {
            console.error('Помилка при оновленні товару:', err);
            setError(err.response?.data?.message || 'Помилка при оновленні товару.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    }

    if (error || !product) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error || 'Товар не знайдено.'}</Alert>
                <Button variant="secondary" onClick={() => navigate('/admin/products')}>
                    ← Назад до списку товарів
                </Button>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-lg">
                        <Card.Header as="h3">Редагувати товар: {product.name}</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Назва</Form.Label>
                                    <Form.Control type="text" name="name" value={product.name || ''} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Опис</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="description" value={product.description || ''} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ціна</Form.Label>
                                    <Form.Control type="number" step="0.01" name="price" value={product.price || ''} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Кількість на складі</Form.Label>
                                    <Form.Control type="number" name="stock" value={product.stock || ''} onChange={handleChange} required min="0" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Категорія</Form.Label>
                                    <Form.Select name="categoryId" value={product.categoryId || ''} onChange={handleChange} required>
                                        <option value="">Оберіть категорію</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <div className="d-flex justify-content-between mt-4">
                                    <Button variant="secondary" onClick={() => navigate('/admin/products')}>Назад</Button>
                                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ?
                                            <><Spinner as="span" animation="border" size="sm" /> Збереження...</> :
                                            'Зберегти зміни'
                                        }
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UpdateProductPage;