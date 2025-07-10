import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Конфігурація API (можна винести в окремий файл)
export const API_ENDPOINTS = {
    BASE_URL: 'http://localhost:8080/api',
    PAYMENTS: 'http://localhost:8080/api/payments',
    ORDERS: 'http://localhost:8080/api/orders',
    USER_ME: 'http://localhost:8080/api/user/me',
};

const CartPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getToken = () => localStorage.getItem('jwt');

    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(cart);

        const totalPrice = cart.reduce((sum, item) => {
            return sum + item.price * item.quantity;
        }, 0);
        setTotal(totalPrice);
    }, []);

    const removeItem = (productId) => {
        const updatedCart = cartItems.filter(item => item.productId !== productId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);

        const newTotal = updatedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotal(newTotal);
    };

    const changeLanguage = (lng) => i18n.changeLanguage(lng);

    const handleCheckout = async () => {
        setError('');
        setLoading(true);

        const token = getToken();
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

        // Логіка визначення назви для відправки на бекенд
        const orderItemsDto = cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            // ВИПРАВЛЕННЯ: Використовуємо перше доступне поле з назвою, пріоритет: nameUa, потім name, потім productName
            productName: item.nameUa || item.name || item.productName || 'Unnamed Product' // Додаємо запасний варіант
        }));

        try {
            const response = await axios.post(
                `${API_ENDPOINTS.ORDERS}/create`,
                orderItemsDto,
                getAuthHeaders()
            );

            if (response.status === 200) {
                localStorage.removeItem('cart');
                setCartItems([]);
                setTotal(0);
                alert(t('order_placed_successfully'));
                navigate('/orders');
            }
        } catch (err) {
            console.error('Помилка при оформленні замовлення:', err);
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setError(t('session_expired_login_again'));
                    localStorage.removeItem('jwt');
                    navigate('/login');
                } else {
                    setError(`${t('error_occurred')}: ${err.response.data.message || err.response.statusText}`);
                }
            } else {
                setError(t('network_server_error'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mt-5">
                <div className="d-flex justify-content-end mb-3">
                    <button onClick={() => changeLanguage('ua')} className="btn btn-outline-primary btn-sm me-2">UA</button>
                    <button onClick={() => changeLanguage('en')} className="btn btn-outline-secondary btn-sm">EN</button>
                </div>
                <h3>🛒 {t('your_cart')}</h3>
                <p>{t('cart_empty')}</p>
                <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
                    ← {t('back')}
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            {/* Language Switch */}
            <div className="d-flex justify-content-end mb-3">
                <button onClick={() => changeLanguage('ua')} className="btn btn-outline-primary btn-sm me-2">UA</button>
                <button onClick={() => changeLanguage('en')} className="btn btn-outline-secondary btn-sm">EN</button>
            </div>

            <h3>🛒 {t('your_cart')}</h3>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <table className="table table-bordered">
                <thead>
                <tr>
                    <th>{t('name')}</th>
                    <th>{t('price')}</th>
                    <th>{t('quantity')}</th>
                    <th>{t('total')}</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {cartItems.map(item => (
                    <tr key={item.productId}>
                        {/* ВИПРАВЛЕННЯ ВІДОБРАЖЕННЯ НАЗВИ */}
                        {/* Цей рядок спробує знайти назву в item.nameUa, потім item.name, потім item.productName */}
                        {/* Виберіть те, що відповідає вашим даним, або залиште так для гнучкості */}
                        <td>{item.nameUa || item.name || item.productName || 'Назва відсутня'}</td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{item.quantity}</td>
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

            <h5 className="mt-3">{t('total')}: {formatPrice(total)}</h5>

            {/* ВИПРАВЛЕННЯ РОЗТАШУВАННЯ КНОПОК: знизу зліва */}
            <div className="d-flex justify-content-start mt-3">
                <button
                    className="btn btn-success me-2" // Кнопка замовлення зліва, має відступ справа
                    onClick={handleCheckout}
                    disabled={loading || cartItems.length === 0}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {t('processing')}...
                        </>
                    ) : (
                        <>✅ {t('checkout')} </>
                    )}
                </button>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    ← {t('back')}
                </button>
            </div>
        </div>
    );
};

const formatPrice = (price) => {
    const language = localStorage.getItem('i18nextLng') || 'ua';
    const options = {
        style: 'currency',
        currency: language === 'en' ? 'USD' : 'UAH',
    };
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'uk-UA', options).format(price);
};

export default CartPage;