import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// 1. ІМПОРТУЄМО нашу нову функцію з api.js
import { createOrder } from '../api';

const CartPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 2. ВИДАЛЯЄМО зайві константи та функції для ручного керування API
    // const API_ENDPOINTS = { ... }; // <-- НЕ ПОТРІБНО
    // const getToken = () => localStorage.getItem('jwt'); // <-- НЕ ПОТРІБНО
    // const getAuthHeaders = () => { ... }; // <-- НЕ ПОТРІБНО

    // Логіка для роботи з кошиком в localStorage - без змін, вона правильна
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

    // 3. СПРОЩУЄМО функцію оформлення замовлення
    const handleCheckout = async () => {
        setError('');
        setLoading(true);

        // Перевірка наявності токена залишається, але використовуємо правильний ключ
        const token = localStorage.getItem('token');
        if (!token) {
            setError(t('login_required_for_checkout'));
            setLoading(false);
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) {
            setError(t('cart_empty_cannot_checkout'));
            setLoading(false);
            return;
        }

        const orderItemsDto = cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            productName: item.nameUa || item.name || item.productName || 'Unnamed Product'
        }));

        try {
            // 4. ВИКОРИСТОВУЄМО нашу централізовану функцію
            const response = await createOrder(orderItemsDto);

            if (response.status === 200) {
                localStorage.removeItem('cart');
                setCartItems([]);
                setTotal(0);
                alert(t('order_placed_successfully'));
                navigate('/orders');
            }
        } catch (err) {
            console.error('Помилка при оформленні замовлення:', err);
            // Глобальний перехоплювач в api.js сам обробить помилку 401/403 (прострочена сесія)
            // Нам залишається обробити інші можливі помилки
            setError(err.response?.data?.message || t('network_server_error'));
        } finally {
            setLoading(false);
        }
    };

    // Функція зміни мови і форматування ціни - без змін
    const changeLanguage = (lng) => i18n.changeLanguage(lng);
    const formatPrice = (price) => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(price || 0);

    // --- JSX-розмітка без змін ---
    // Вона написана добре і не потребує правок

    if (cartItems.length === 0) {
        return (
            <div className="container mt-5 text-center">
                <h3>🛒 {t('your_cart')}</h3>
                <p className="lead mt-3">{t('cart_empty')}</p>
                <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
                    {t('to_shopping')}
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-end mb-3">
                <button onClick={() => changeLanguage('ua')} className="btn btn-outline-primary btn-sm me-2">UA</button>
                <button onClick={() => changeLanguage('en')} className="btn btn-outline-secondary btn-sm">EN</button>
            </div>

            <h3>🛒 {t('your_cart')}</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <table className="table table-hover">
                <thead className="table-light">
                <tr>
                    <th>{t('name')}</th>
                    <th>{t('price')}</th>
                    <th style={{ width: '120px' }}>{t('quantity')}</th>
                    <th>{t('total')}</th>
                    <th style={{ width: '100px' }}></th>
                </tr>
                </thead>
                <tbody>
                {cartItems.map(item => (
                    <tr key={item.productId}>
                        <td>{getProductName(item)}</td>
                        <td>{formatPrice(item.price)}</td>
                        <td>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.productId, e.target.value)}
                                style={{ maxWidth: '80px' }}
                            />
                        </td>
                        <td>{formatPrice(item.price * item.quantity)}</td>
                        <td>
                            <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.productId)}>
                                {t('remove')}
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="d-flex justify-content-end align-items-center mt-3">
                <h4 className="me-4">{t('total')}: {formatPrice(total)}</h4>
                <button
                    className="btn btn-success btn-lg"
                    onClick={handleCheckout}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {t('processing')}...
                        </>
                    ) : (
                        `✅ ${t('checkout')}`
                    )}
                </button>
            </div>
            <button className="btn btn-outline-secondary mt-4" onClick={() => navigate(-1)}>
                ← {t('back_to_shopping')}
            </button>
        </div>
    );
};

export default CartPage;