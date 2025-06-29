import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const [userId, setUserId] = useState(null);
    const token = localStorage.getItem('jwt');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setMessage('Ви не авторизовані. Будь ласка, увійдіть.');
                return;
            }
            try {
                const response = await axios.get('http://localhost:8080/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserId(response.data.id);
            } catch (error) {
                setMessage('Не вдалося отримати дані користувача');
            }
        };

        fetchUser();

        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(storedCart);
    }, [token]);

    const removeFromCart = (productId) => {
        const updatedCart = cart.filter(item => item.productId !== productId);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const handleOrder = async () => {
        if (!token || !userId) {
            setMessage('Ви не авторизовані. Будь ласка, увійдіть.');
            return;
        }

        setLoading(true);
        try {
            const orderItems = cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            }));

            await axios.post(
                "http://localhost:8080/api/orders/create",
                orderItems,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setMessage('Замовлення успішно створено!');
            localStorage.removeItem('cart');
            setCart([]);
            navigate('/orders'); // перенаправлення після створення
        } catch (e) {
            setMessage('Помилка при створенні замовлення');
        } finally {
            setLoading(false);
        }
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="container mt-5">
         <button className="btn btn-secondary mt-3" onClick={() => window.history.back()}>
                                                        Назад
                                                    </button>
            <h3>🛒 Корзина</h3>
            {message && <p className="text-success">{message}</p>}
            {cart.length === 0 ? (
                <p>Ваша корзина пуста.</p>
            ) : (
                <div>
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
                        {cart.map(item => (
                            <tr key={item.productId}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(item.price)}</td>
                                <td>
                                    <button className="btn btn-danger btn-sm"
                                            onClick={() => removeFromCart(item.productId)}>
                                        Видалити
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <p><strong>Загальна сума:</strong> {new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(total)}</p>
                    <button className="btn btn-success" onClick={handleOrder} disabled={loading}>
                        {loading ? 'Оформлення...' : 'Оформити замовлення'}
                    </button>

                </div>

            )}
        </div>
    );
};

export default CartPage;
