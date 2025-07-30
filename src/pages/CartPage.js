import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert, Form, Image } from 'react-bootstrap';

const CartPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    // Стан та функції для роботи з кошиком
    const [cartItems, setCartItems] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const [error, setError] = React.useState(''); // Для відображення повідомлень

    const calculateTotal = (items) => {
        const newTotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
        setTotal(newTotal);
    };

    React.useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(cart);
        calculateTotal(cart);
    }, []);

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

    const getProductName = (item) => item.name || item.productName || t('name_missing');

    // ↓↓↓↓↓↓  ВИПРАВЛЕНА ФУНКЦІЯ  ↓↓↓↓↓↓
    /**
     * Ця функція тепер просто перенаправляє на сторінку оформлення замовлення.
     * Всі перевірки (чи залогінений користувач) буде робити сама сторінка CreateOrderPage.
     */
    const handleProceedToCheckout = () => {
        if (cartItems.length === 0) {
            setError(t('cart_empty')); // Показуємо помилку, якщо кошик порожній
            return;
        }
        // Просто перенаправляємо, передаючи дані кошика.
        navigate('/orders/create', { state: { items: cartItems, total: total } });
    };

    const formatPrice = (price) => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(price || 0);
    const changeLanguage = (lng) => i18n.changeLanguage(lng);


    // --- JSX-розмітка ---

    if (cartItems.length === 0) {
        return (
            <Container className="mt-5 text-center">
                <Card className="p-5 shadow-sm">
                    <Card.Body>
                        <h3>🛒 {t('your_cart')}</h3>
                        <p className="lead mt-3">{t('cart_empty')}</p>
                        {error && <Alert variant="warning" className="mt-3">{error}</Alert>}
                        <Button variant="primary" className="mt-3" onClick={() => navigate('/')}>
                            {t('to_shopping')}
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col lg={8} md={10}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>🛒 {t('your_cart')}</h3>
                        <div className="d-flex">
                            <Button onClick={() => changeLanguage('ua')} variant="outline-primary" size="sm" className="me-2">UA</Button>
                            <Button onClick={() => changeLanguage('en')} variant="outline-secondary" size="sm">EN</Button>
                        </div>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Card className="shadow-sm">
                        <Card.Body>
                            <Table responsive="sm" className="align-middle">
                                <thead>
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
                                        <td className="text-end">{formatPrice((item.price || 0) * (item.quantity || 1))}</td>
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
                        <Card.Footer className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <Button variant="outline-secondary" onClick={() => navigate('/')}>
                                ← {t('back_to_shopping')}
                            </Button>
                            <div className="text-end">
                                <h4 className="mb-3">{t('total')}: {formatPrice(total)}</h4>
                                <Button
                                    variant="success"
                                    size="lg"
                                    onClick={handleProceedToCheckout} // <-- Тепер ця кнопка працює правильно
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