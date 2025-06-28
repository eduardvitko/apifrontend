import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const OrderDetailsPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('jwt');

    useEffect(() => {
        const fetchOrder = async () => {
            if (!token) {
                setError('Ви не авторизовані');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:8080/api/orders/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setOrder(response.data);
            } catch (e) {
                setError('Не вдалося завантажити замовлення');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, token]);

    if (loading) return <p>Завантаження...</p>;
    if (error) return <p className="text-danger">{error}</p>;
    if (!order) return <p>Замовлення не знайдено</p>;

    return (
        <div className="container mt-5">
            <h3>Деталі замовлення #{order.id}</h3>
            <p>Статус: {order.status}</p>
            <p>Дата: {new Date(order.orderDate).toLocaleString()}</p>
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
                        <td>{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(item.price)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <p><strong>Загальна сума: {new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(order.total)}</strong></p>
        </div>
    );
};

export default OrderDetailsPage;
