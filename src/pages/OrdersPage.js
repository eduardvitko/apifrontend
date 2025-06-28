import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const token = localStorage.getItem('jwt');

    useEffect(() => {
        const fetchUserAndOrders = async () => {
            if (!token) {
                setError('Ви не авторизовані');
                setLoading(false);
                return;
            }

            try {
                const userResponse = await axios.get('http://localhost:8080/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserId(userResponse.data.id);

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

        fetchUserAndOrders();
    }, [token]);

    if (loading) return <p>Завантаження...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-5">
            <h3>Мої замовлення</h3>
            {orders.length === 0 ? (
                <p>У вас немає замовлень.</p>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="card mb-4">
                        <div className="card-header">
                            <strong>Замовлення #{order.id}</strong> — Статус: {order.status} — Дата: {new Date(order.orderDate).toLocaleString()}
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
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default OrdersPage;
