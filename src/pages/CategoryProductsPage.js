import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 1. ІМПОРТУЄМО КОМПОНЕНТИ З REACT-BOOTSTRAP
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';

import { fetchProductsByCategory as fetchProductsByCategoryAPI } from '../api';

const CategoryProductsPage = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingProductId, setAddingProductId] = useState(null);

    const fetchProducts = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetchProductsByCategoryAPI(id);
            setProducts(response.data);
        } catch (e) {
            console.error("Помилка завантаження товарів:", e);
            setError(t('fetch_error'));
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, i18n.language]);

    const addToCart = (product) => {
        setAddingProductId(product.id);
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingIndex = cart.findIndex(item => item.productId === product.id);

        if (existingIndex !== -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                imageUrl: product.images && product.images.length > 0 ? product.images[0].url : null
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        setTimeout(() => {
            setAddingProductId(null);
            navigate('/cart');
        }, 300);
    };

    const changeLanguage = (lng) => i18n.changeLanguage(lng);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">{t('loading')}...</p>
            </Container>
        );
    }

    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    ← {t('back')}
                </Button>
                <div className="d-flex">
                    <Button onClick={() => changeLanguage('ua')} variant="outline-primary" size="sm" className="me-2">UA</Button>
                    <Button onClick={() => changeLanguage('en')} variant="outline-secondary" size="sm">EN</Button>
                </div>
            </div>

            <h3 className="mb-4">{t('products_in_category')}</h3>

            {products.length === 0 ? (
                <Alert variant="info">{t('no_products')}</Alert>
            ) : (
                // 2. ВИКОРИСТОВУЄМО СІТКУ BOOTSTRAP ЗАМІСТЬ ТАБЛИЦІ
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {products.map(product => (
                        <Col key={product.id}>
                            <Card className="h-100 shadow-sm d-flex flex-column">
                                {/* Зображення товару поверх картки */}
                                <Card.Img
                                    variant="top"
                                    src={product.images && product.images.length > 0 ? product.images[0].url : 'https://via.placeholder.com/400x300?text=No+Image'}
                                    alt={product.name}
                                    style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                                    onClick={() => navigate(`/products/${product.id}`)} // Перехід на сторінку деталей
                                />
                                <Card.Body className="d-flex flex-column flex-grow-1">
                                    {/* Назва, опис, ціна і залишок всередині "тіла" картки */}
                                    <Card.Title style={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${product.id}`)}>
                                        {product.name}
                                    </Card.Title>
                                    <Card.Text className="text-muted small">{product.description}</Card.Text>

                                    <div className="mt-auto">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-bold fs-5">{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(product.price)}</span>
                                            <span className="text-muted small">Залишок: {product.stock}</span>
                                        </div>

                                        {/* Кнопка "Додати в кошик" знизу */}
                                        <Button
                                            variant="primary"
                                            className="w-100"
                                            disabled={addingProductId === product.id || product.stock === 0}
                                            onClick={() => addToCart(product)}
                                        >
                                            {product.stock === 0 ? 'Немає в наявності' :
                                                (addingProductId === product.id ? t('adding') : t('add_to_cart'))}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default CategoryProductsPage;