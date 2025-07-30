import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// 1. ІМПОРТУЄМО КОМПОНЕНТИ З REACT-BOOTSTRAP
import { Container, Row, Col, Card, Button, Table, Alert, Form, Image } from 'react-bootstrap';

// Імпортуємо нашу централізовану функцію.
// Вона потрібна для переходу на сторінку CreateOrderPage, а не для прямого створення.
// import { createOrder } from '../api'; // Поки що не потрібна

const CartPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const updateQuantity = (productId, newQuantity) => {
        const updatedCart = cartItems.map(item =>
            item.productId === productId
                ? { ...item, quantity: Math.max(1, parseInt(newQuantity) || 1) }
                : item
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        calculateTotal(updatedCart);
    };

    const removeItem = (productId) => {
        const updatedCart = cartItems.filter(item => item.productId !== productId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        calculateTotal(updatedCart);
    };

    const calculateTotal = (items) => {
        const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotal(newTotal);
    };

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(cart);
        calculateTotal(cart);
    }, []);

    const getProductName = (item) => item.nameUa || item.name || item.productName || t('name_missing');

    // Оновлена функція, яка переходить на сторінку оформлення
    const handleProceedToCheckout = () => {
        if (!localStorage.getItem('token')) {
            setError(t('login_required_for_checkout'));
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        if (cartItems.length === 0) {
            setError(t('cart_empty'));
            return;
        }
        navigate('/orders/create', { state: { items: cartItems, total: total } });
    };

    const formatPrice = (price) => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(price || 0);

    // --- JSX-розмітка з компактним дизайном ---

    if (cartItems.length === 0 && !error) {
        return (
            <Container className="mt-5 text-center">
                <Card className="p-5 shadow-sm">
                    <Card.Body>
                        <h3>🛒 {t('your_cart')}</h3>
                        <p className="lead mt-3">{t('cart_empty')}</p>
                        <Button variant="primary" className="mt-3" onClick={() => navigate('/')}>
                            {t('to_shopping')}
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        // 2. ОБГОРТАЄМО ВСЕ В ROW ТА COL, ЩОБ ОБМЕЖИТИ ШИРИНУ
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col lg={8} md={10}> {/* lg={8} - на великих екранах, md={10} - на середніх */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>🛒 {t('your_cart')}</h3>
                        {/* Кнопки мови можна винести в Navbar для глобального доступу */}
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Card className="shadow-sm">
                        <Card.Body>
                            <Table responsive="sm" className="align-middle">
                                <thead /* className="table-light" */>
                                <tr>
                                    <th colSpan="2">{t('name')}</th>
                                    <th>{t('price')}</th>
                                    <th style={{ width: '120px' }}>{t('quantity')}</th>
                                    <th className="text-end">{t('total')}</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                                </thead>
                                <tbody>
                                {cartItems.map(item => (
                                    <tr key={item.productId}>
                                        <td style={{width: '70px'}}>
                                            <Image
                                                src={item.imageUrl || 'https://via.placeholder.com/60'}
                                                alt={getProductName(item)}
                                                rounded
                                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                            />
                                        </td>
                                        <td>{getProductName(item)}</td>
                                        <td>{formatPrice(item.price)}</td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                size="sm"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.productId, e.target.value)}
                                                style={{ maxWidth: '80px' }}
                                            />
                                        </td>
                                        <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
                                        <td className="text-center">
                                            <Button variant="outline-danger" size="sm" onClick={() => removeItem(item.productId)}>
                                                ×
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-between align-items-center">
                            <Button variant="outline-secondary" onClick={() => navigate('/')}>
                                ← {t('back_to_shopping')}
                            </Button>
                            <div className="text-end">
                                <h4 className="mb-3">{t('total')}: {formatPrice(total)}</h4>
                                <Button
                                    variant="success"
                                    size="lg"
                                    onClick={handleProceedToCheckout} // Використовуємо нову функцію
                                >
                                    {`✅ ${t('checkout')}`}
                                </Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CartPage;