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

            const updatedOrders = orders.map(order =>
                order.id === orderId ? { ...order, status: 'CANCELLED' } : order
            );
            setOrders(updatedOrders);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Помилка при скасуванні замовлення');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        const confirmed = window.confirm('Ви дійсно хочете видалити це замовлення? Цю дію не можна буде скасувати.');
        if (!confirmed) return;

        try {
            await await axios.delete(`http://localhost:8080/api/orders/delete/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Замовлення видалено');

            const updatedOrders = orders.filter(order => order.id !== orderId);
            setOrders(updatedOrders);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Помилка при видаленні замовлення');
        }
    };

    if (loading) return <p>Завантаження...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-5">
            <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
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
