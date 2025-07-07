import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from './UseCart';

const CartPage = () => {
    const { cart, changeQuantity, removeItem, clearCart } = useCart();
    const [userId, setUserId] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('jwt');

    useEffect(() => {
        if (!token) {
            setMessage('Ви не авторизовані. Будь ласка, увійдіть.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserId(response.data.id);
            } catch (error) {
                setMessage('Не вдалося отримати дані користувача');
            }
        };

        fetchUser();
    }, [token, navigate]);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleOrder = async () => {
        if (!token || !userId) {
            setMessage('Ви не авторизовані. Будь ласка, увійдіть.');
            return;
        }

        if (cart.length === 0) {
            setMessage('Корзина порожня.');
            return;
        }

        setLoading(true);
        setMessage('');
        try {
            const orderItems = cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            }));

            await axios.post(
                'http://localhost:8080/api/orders/create',
                orderItems,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage('Замовлення успішно створено!');
            clearCart();
            setTimeout(() => navigate('/orders'), 1500);
        } catch (e) {
            setMessage('Помилка при створенні замовлення');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <button className="btn btn-secondary mt-3" onClick={() => window.history.back()}>
                Назад
            </button>
            <h3>🛒 Корзина</h3>

            {message && <p className={`text-${message.toLowerCase().includes('помилка') ? 'danger' : 'success'}`}>{message}</p>}

            {cart.length === 0 ? (
                <p>Ваша корзина пуста.</p>
            ) : (
                <>
                    <table className="table table-bordered">
                        <thead>
                        <tr>
                            <th>Назва</th>
                            <th>Кількість</th>
                            <th>Ціна</th>
                            <th>Дія</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cart.map(item => {
                            const inputId = `quantity-${item.productId}`;
                            return (
                                <tr key={item.productId}>
                                    <td>{item.name}</td>
                                    <td>
                                        <label htmlFor={inputId} className="visually-hidden">
                                            Кількість для {item.name}
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            id={inputId}
                                            name={inputId}
                                            value={item.quantity}
                                            onChange={e => changeQuantity(item.productId, Number(e.target.value))}
                                            style={{ width: '60px' }}
                                        />
                                    </td>
                                    <td>{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(item.price)}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => {
                                                if (window.confirm('Ви дійсно хочете видалити цей товар?')) removeItem(item.productId);
                                            }}
                                        >
                                            Видалити
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    <p><strong>Загальна сума:</strong> {new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(total)}</p>
                    <button className="btn btn-success" onClick={handleOrder} disabled={loading}>
                        {loading ? 'Оформлення...' : 'Оформити замовлення'}
                    </button>
                </>
            )}
        </div>
    );
};

export default CartPage;
