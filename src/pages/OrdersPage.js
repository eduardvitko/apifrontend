import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('jwt');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) {
                setError('Ви не авторизовані');
                setLoading(false);
                return;
            }

            try {
                const userResponse = await axios.get('http://localhost:8080/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Припускаємо, що API повертає замовлення з полем userId,
                // або що /api/orders/user/{id} вже фільтрує замовлення для цього користувача.
                const ordersResponse = await axios.get(`http://localhost:8080/api/orders/user/${userResponse.data.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setOrders(ordersResponse.data);
            } catch (err) {
                console.error("Помилка завантаження замовлень:", err);
                setError('Не вдалося завантажити замовлення. Будь ласка, спробуйте пізніше.');
                // Якщо помилка 401/403, можливо, токен недійсний, перенаправляємо на логін
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    localStorage.removeItem('jwt');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token, navigate]); // Додано navigate до залежностей useEffect

    const handleCancelOrder = async (orderId) => {
        // Замість window.confirm використовуємо більш дружній UI (але для прикладу залишаємо)
        const confirmed = window.confirm('Ви дійсно хочете скасувати це замовлення?');
        if (!confirmed) return;

        try {
            await axios.put(`http://localhost:8080/api/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Замовлення скасовано'); // Замінити на UI-повідомлення

            const updatedOrders = orders.map(order =>
                order.id === orderId ? { ...order, status: 'CANCELLED' } : order
            );
            setOrders(updatedOrders);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Помилка при скасуванні замовлення'); // Замінити на UI-повідомлення
        }
    };

    const handleDeleteOrder = async (orderId) => {
        // Замість window.confirm використовуємо більш дружній UI (але для прикладу залишаємо)
        const confirmed = window.confirm('Ви дійсно хочете видалити це замовлення? Цю дію не можна буде скасувати.');
        if (!confirmed) return;

        try {
            await axios.delete(`http://localhost:8080/api/orders/delete/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Замовлення видалено'); // Замінити на UI-повідомлення

            const updatedOrders = orders.filter(order => order.id !== orderId);
            setOrders(updatedOrders);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Помилка при видаленні замовлення'); // Замінити на UI-повідомлення
        }
    };

    // Нова функція для обробки натискання кнопки "Сплатити"
    const handlePayOrder = (orderId, orderTotal) => {
        // Перенаправляємо на сторінку платежів, передаючи дані замовлення через state
        navigate('/payments', { state: { orderId, amount: orderTotal } });
    };

    if (loading) return <p className="text-center mt-5">Завантаження...</p>;
    if (error) return <p className="text-danger text-center mt-5">{error}</p>;

    return (
        <div className="container mt-5">
            <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
                Назад
            </button>

            <h3 className="mt-4">Мої замовлення</h3>

            {orders.length === 0 ? (
                <p className="text-center">У вас немає замовлень.</p>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="card mb-4">
                        <div className="card-header">
                            <strong>Замовлення #{order.id}</strong> — Статус: <span className={
                            order.status === 'CANCELLED' ? 'text-danger' :
                                order.status === 'COMPLETED' ? 'text-success' : 'text-warning'
                        }>
                                {order.status}
                            </span> — Дата: {new Date(order.orderDate).toLocaleString()}
                        </div>
                        <div className="card-body">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Назва товару</th>
                                    <th>Кількість</th>
                                    <th>Ціна</th>
                                </tr>
                                </thead>
                                <tbody>
                                {order.items && order.items.map(item => ( // Додано перевірку order.items
                                    <tr key={item.id}>
                                        <td>{item.productName}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.price} ₴</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <p><strong>Загальна сума: {order.total ? order.total.toFixed(2) : '0.00'} ₴</strong></p>

                            {order.status === 'PENDING' && (
                                <div className="d-flex gap-2 mt-2">
                                    <button
                                        className="btn btn-success" // Кнопка "Сплатити"
                                        onClick={() => handlePayOrder(order.id, order.total)}
                                    >
                                        Сплатити
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleCancelOrder(order.id)}
                                    >
                                        Скасувати замовлення
                                    </button>
                                </div>
                            )}

                            {order.status === 'CANCELLED' && (
                                <button
                                    className="btn btn-outline-danger mt-2"
                                    onClick={() => handleDeleteOrder(order.id)}
                                >
                                    Видалити замовлення
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default OrdersPage;
