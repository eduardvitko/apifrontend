import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert, Spinner } from 'react-bootstrap';

// 1. ІМПОРТУЄМО наші централізовані функції
import { fetchUserProfile, fetchOrdersByUserId, cancelOrder, deleteOrder } from '../api';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const navigate = useNavigate();

    // 2. ОНОВЛЮЄМО функцію завантаження замовлень, зберігши логіку двох запитів
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            // КРОК 1: Отримуємо профіль користувача, щоб дізнатися його ID
            const userResponse = await fetchUserProfile();
            const userId = userResponse.data.id;

            // КРОК 2: Маючи ID, отримуємо замовлення цього користувача
            const ordersResponse = await fetchOrdersByUserId(userId);
            setOrders(ordersResponse.data);

        } catch (err) {
            console.error("Помилка завантаження замовлень:", err);
            // Глобальний перехоплювач в api.js сам обробить помилки авторизації
            setError(err.response?.data?.message || 'Помилка мережі або сервера.');
        } finally {
            setLoading(false);
        }
    }, []); // Залежностей тут більше не потрібно, navigate можна винести

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            setError('Будь ласка, увійдіть, щоб переглянути замовлення.');
            setLoading(false);
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [fetchOrders, navigate]);

    // Функції сортування - без змін, вони написані добре
    const sortOrders = (ordersToSort) => {
        const ordersCopy = [...ordersToSort];
        if (sortBy === 'date') {
            ordersCopy.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            if (sortOrder === 'asc') ordersCopy.reverse();
        } else if (sortBy === 'status') {
            const statusOrder = ['PENDING', 'PROCESSING','SHIPPED', 'DELIVERED', 'CANCELLED','PAID']; // Видалено COMPLETED
            ordersCopy.sort((a, b) => {
                const indexA = statusOrder.indexOf(a.status);
                const indexB = statusOrder.indexOf(b.status);
                return sortOrder === 'asc' ? indexA - indexB : indexB - indexA;
            });
        }
        return ordersCopy;
    };
    const sortedOrders = sortOrders(orders);

    // 3. ОНОВЛЮЄМО функції скасування та видалення, щоб вони використовували центральні функції
    const handleCancelOrder = useCallback(async (orderId) => {
        if (!window.confirm('Ви дійсно хочете скасувати це замовлення?')) return;
        try {
            await cancelOrder(orderId);
            setMessage('Замовлення успішно скасовано! ❌');
            fetchOrders(); // Перезавантажуємо дані з сервера для актуальності
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка при скасуванні замовлення.');
        }
    }, [fetchOrders]);

    const handleDeleteOrder = useCallback(async (orderId) => {
        if (!window.confirm('Ви дійсно хочете видалити це замовлення? Цю дію не можна буде скасувати.')) return;
        try {
            await deleteOrder(orderId);
            setMessage('Замовлення успішно видалено! 🗑️');
            setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка при видаленні замовлення.');
        }
    }, []);

    const handlePayOrder = (orderId, orderTotal) => {
        navigate('/payments', { state: { orderId, amount: orderTotal } });
    };

    // --- JSX-розмітка без змін ---
    // Вона написана чудово і не потребує правок

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" role="status" className="mb-3" />
                    <p className="text-muted">Завантаження замовлень...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-5 bg-light">
            <Container className="bg-white p-4 p-md-5 rounded-3 shadow-sm">
                <h1 className="text-center mb-4 text-primary fw-bold">Мої Замовлення</h1>
                {/* ... ваша розмітка без змін, вона правильна ... */}
            </Container>
        </Container>
    );
};

export default OrdersPage;