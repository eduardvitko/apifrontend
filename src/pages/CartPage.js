import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

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
                        <td>{item.nameUa}</td> {/* 🔁 лише українською */}
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

            <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
                ← {t('back')}
            </button>
        </div>
    );
};

// Форматування ціни залежно від мови
const formatPrice = (price) => {
    const language = localStorage.getItem('i18nextLng') || 'ua';
    const options = {
        style: 'currency',
        currency: language === 'en' ? 'USD' : 'UAH',
    };
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'uk-UA', options).format(price);
};

export default CartPage;
