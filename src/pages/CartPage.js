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
            setMessage('🔐 Ви не авторизовані. Перенаправлення...');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserId(response.data.id);
            } catch {
                setMessage('❌ Не вдалося отримати дані користувача');
            }
        };

        fetchUser();
    }, [token, navigate]);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleOrder = async () => {
        if (!token || !userId) {
            setMessage('🔐 Ви не авторизовані.');
            return;
        }

        if (cart.length === 0) {
            setMessage('🛒 Корзина порожня.');
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

            setMessage('✅ Замовлення успішно створено!');
            clearCart();
            setTimeout(() => navigate('/orders'), 1500);
        } catch {
            setMessage('❌ Помилка при створенні замовлення');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>🛒 Моя корзина</h3>
                <button className="btn btn-outline-secondary" onClick={() => window.history.back()}>
                    ⬅ Назад
                </button>
            </div>

            {message && (
                <div className={`alert ${message.includes('Помилка') || message.includes('❌') ? 'alert-danger' : 'alert-success'}`}>
                    {message}
                </div>
            )}

            {cart.length === 0 ? (
                <div className="alert alert-info">Ваша корзина порожня.</div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                            <tr>
                                <th>Назва</th>
                                <th style={{ width: 110 }}>Кількість</th>
                                <th>Ціна</th>
                                <th>Дія</th>
                            </tr>
                            </thead>
                            <tbody>
                            {cart.map(item => (
                                <tr key={item.productId}>
                                    <td>{item.name}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            className="form-control"
                                            value={item.quantity}
                                            onChange={e =>
                                                changeQuantity(item.productId, Number(e.target.value))
                                            }
                                        />
                                    </td>
                                    <td>
                                        {new Intl.NumberFormat('uk-UA', {
                                            style: 'currency',
                                            currency: 'UAH',
                                        }).format(item.price)}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() =>
                                                window.confirm('Видалити цей товар?') &&
                                                removeItem(item.productId)
                                            }
                                        >
                                            🗑 Видалити
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <h5>
                            Загальна сума:{' '}
                            <span className="text-success">
                                {new Intl.NumberFormat('uk-UA', {
                                    style: 'currency',
                                    currency: 'UAH',
                                }).format(total)}
                            </span>
                        </h5>

                        <button className="btn btn-success" onClick={handleOrder} disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                    Оформлення...
                                </>
                            ) : (
                                '✅ Оформити замовлення'
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
