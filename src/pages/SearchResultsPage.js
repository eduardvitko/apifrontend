import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';

// 1. ІМПОРТУЄМО нашу централізовану функцію
import { searchProducts as searchProductsAPI } from '../api';

// Допоміжний хук для отримання параметрів з URL
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const SearchResultsPage = () => {
    const query = useQuery();
    const searchTerm = query.get('q');
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProducts = useCallback(async () => {
        if (!searchTerm) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            // 2. ВИКОРИСТОВУЄМО нашу централізовану функцію
            const response = await searchProductsAPI(searchTerm);
            // Фільтрацію можна залишити, якщо це ваша бізнес-логіка
            const filtered = response.data.filter(p => p.images?.length > 0 && p.price > 0 && p.stock > 0);
            setProducts(filtered);
        } catch (e) {
            console.error('Помилка пошуку товарів:', e);
            if (e.response && e.response.status === 404) {
                setProducts([]); // Якщо нічого не знайдено, показуємо порожній список
            } else {
                setError('Помилка завантаження товарів.');
            }
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const addToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const idx = cart.findIndex(i => i.productId === product.id);
        if (idx >= 0) {
            cart[idx].quantity += 1;
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
        alert(`Додано "${product.name}" в корзину`);
        navigate('/cart');
    };

    // --- JSX-розмітка з покращеннями ---

    if (loading) {
        return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    }

    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    return (
        <Container className="mt-4">
            <h3 className="mb-4">Результати пошуку для: "{searchTerm}"</h3>
            {products.length === 0 ? (
                <Alert variant="info">За вашим запитом товарів не знайдено.</Alert>
            ) : (
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {products.map(product => (
                        <Col key={product.id}>
                            <Card className="h-100 shadow-sm">
                                <Card.Img
                                    variant="top"
                                    src={product.images[0].url}
                                    alt={product.images[0].altText || product.name}
                                    style={{ height: 200, objectFit: 'cover' }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{product.name}</Card.Title>
                                    <div className="mt-auto">
                                        <p className="fw-bold fs-5">{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(product.price)}</p>
                                        <Button
                                            variant="primary"
                                            className="w-100"
                                            onClick={() => addToCart(product)}
                                        >
                                            Додати в кошик
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

export default SearchResultsPage;