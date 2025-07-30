import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert, Form, Image, Spinner } from 'react-bootstrap';

// 1. ПОВЕРТАЄМО ІМПОРТ функції createOrder
import { createOrder } from '../api';

const CartPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false); // Стан для блокування кнопки
    const [error, setError] = useState('');

    const calculateTotal = (items) => {
        const newTotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
        setTotal(newTotal);
    };

    useEffect(() => {
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
    const formatPrice = (price) => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(price || 0);

    // 2. ПОВЕРТАЄМО ПОВНУ ЛОГІКУ СТВОРЕННЯ ЗАМОВЛЕННЯ
    const handleCheckout = async () => {
        setError('');
        setLoading(true);

        if (!localStorage.getItem('token')) {
            setError('Будь ласка, увійдіть, щоб оформити замовлення.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        if (cartItems.length === 0) {
            setError('Ваш кошик порожній.');
            setLoading(false);
            return;
        }

        // Готуємо дані для відправки на бекенд
        const orderItemsDto = cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            productName: item.name // Переконайтесь, що поле 'name' є в об'єкті товару в кошику
        }));

        try {
            // Викликаємо API для створення замовлення
            const response = await createOrder(orderItemsDto);

            if (response.status === 200 || response.status === 201) {
                // Очищуємо кошик
                localStorage.removeItem('cart');
                setCartItems([]);
                setTotal(0);

                alert('Замовлення успішно створено!');

                // 3. ПЕРЕНАПРАВЛЯЄМО НА СТОРІНКУ "МОЇ ЗАМОВЛЕННЯ"
                navigate('/orders');
            }
        } catch (err) {
            console.error('Помилка при оформленні замовлення:', err);
            setError(err.response?.data?.message || 'Сталася помилка при оформленні замовлення.');
        } finally {
            setLoading(false);
        }
    };

    // --- JSX-розмітка ---

    if (cartItems.length === 0) {
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
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col lg={8} md={10}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>🛒 {t('your_cart')}</h3>
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
                                            <Image src={item.imageUrl || 'https://via.placeholder.com/60'} alt={getProductName(item)} rounded style={{ width: '60px', height: '60px', objectFit: 'cover' }}/>
                                        </td>
                                        <td>{getProductName(item)}</td>
                                        <td>{formatPrice(item.price)}</td>
                                        <td>
                                            <Form.Control type="number" size="sm" min="1" value={item.quantity} onChange={(e) => updateQuantity(item.productId, e.target.value)} style={{ maxWidth: '80px' }} />
                                        </td>
                                        <td className="text-end">{formatPrice((item.price || 0) * (item.quantity || 1))}</td>
                                        <td className="text-center">
                                            <Button variant="outline-danger" size="sm" onClick={() => removeItem(item.productId)}>×</Button>
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
                                    onClick={handleCheckout}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                            <span className="ms-2">{t('processing')}...</span>
                                        </>
                                    ) : `✅ ${t('checkout')}`}
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