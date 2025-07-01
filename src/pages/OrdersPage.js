import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('jwt');

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

                const ordersResponse = await axios.get(`http://localhost:8080/api/orders/user/${userResponse.data.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setOrders(ordersResponse.data);
            } catch (err) {
                setError('Не вдалося завантажити замовлення');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    const handleCancelOrder = async (orderId) => {
        const confirmed = window.confirm('Ви дійсно хочете скасувати це замовлення?');
        if (!confirmed) return;

        try {
            await axios.put(`http://localhost:8080/api/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Замовлення скасовано');

            // Оновлюємо статус в локальному state
            const updatedOrders = orders.map(order =>
                order.id === orderId ? { ...order, status: 'CANCELLED' } : order
            );
            setOrders(updatedOrders);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Помилка при скасуванні замовлення');
        }
    };

    if (loading) return <p>Завантаження...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-5">
            <button className="btn btn-secondary mt-3" onClick={() => window.history.back()}>
                Назад
            </button>

            <h3 className="mt-4">Мої замовлення</h3>

            {orders.length === 0 ? (
                <p>У вас немає замовлень.</p>
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
                                {order.items.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.productName}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.price} ₴</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <p><strong>Загальна сума: {order.total} ₴</strong></p>

                            {order.status === 'PENDING' && (
                                <button
                                    className="btn btn-danger mt-2"
                                    onClick={() => handleCancelOrder(order.id)}
                                >
                                    Скасувати замовлення
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
