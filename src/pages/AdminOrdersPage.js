import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8080/api/orders/all/with-address', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
        })
            .then(res => {
                setOrders(res.data);
            })
            .catch(err => {
                setError('Не вдалося завантажити замовлення');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Завантаження...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mt-4">
            <h3>Всі замовлення</h3>
            {orders.length === 0 && <p>Замовлень немає</p>}
            {orders.map(order => (
                <div key={order.id} className="card mb-3">
                    <div className="card-body">
                        <h5>Замовлення #{order.id}</h5>
                        <p><b>Користувач:</b> {order.username} (ID: {order.userId})</p>
                        <p><b>Телефон:</b> {order.phone}</p>
                        {order.address ? (
                            <>
                                <p><b>Адреса:</b> {order.address.city}, {order.address.street} {order.address.houseNumber}</p>
                                {order.address.apartmentNumber && <p>Квартира: {order.address.apartmentNumber}</p>}
                                {order.address.region && <p>Регіон: {order.address.region}</p>}
                                {order.address.postalCode && <p>Індекс: {order.address.postalCode}</p>}
                                <p>Країна: {order.address.country}</p>
                            </>
                        ) : (
                            <p>Адреса не вказана</p>
                        )}
                        <p><b>Дата:</b> {new Date(order.orderDate).toLocaleString()}</p>
                        <p><b>Статус:</b> {order.status}</p>
                        <p><b>Загальна сума:</b> {order.total}</p>
                        <h6>Товари:</h6>
                        <ul>
                            {order.items.map(item => (
                                <li key={item.id}>
                                    {item.productName} — {item.quantity} шт. по {item.price} грн
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminOrdersPage;
