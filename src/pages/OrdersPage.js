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

    // 2. ОНОВЛЮЄМО функцію завантаження замовлень
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        setMessage('');

        // Перевіряємо наявність токена
        if (!localStorage.getItem('token')) {
            setError('Будь ласка, увійдіть, щоб переглянути замовлення.');
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            // КРОК 1: Отримуємо профіль користувача, щоб дізнатися його ID
            const userResponse = await fetchUserProfile();
            const userId = userResponse.data.id;

            // КРОК 2: Маючи ID, отримуємо замовлення цього користувача
            const ordersResponse = await fetchOrdersByUserId(userId);
            setOrders(ordersResponse.data);

        } catch (err) {
            console.error("Помилка завантаження замовлень:", err);
            // Глобальний перехоплювач в api.js сам обробить помилку 401/403 (прострочена сесія)
            setError(err.response?.data?.message || 'Помилка мережі або сервера.');
        } finally {
            setLoading(false);
        }
    }, [navigate]); // navigate додано до залежностей

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Функції сортування - без змін, вони написані добре
    const sortOrders = (ordersToSort) => {
        const ordersCopy = [...ordersToSort];
        // ... ваша логіка сортування без змін ...
        if (sortBy === 'date') {
            ordersCopy.sort((a, b) => {
                const dateA = new Date(a.orderDate);
                const dateB = new Date(b.orderDate);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
        } else if (sortBy === 'status') {
            const statusOrder = ['PENDING', 'PROCESSING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
            ordersCopy.sort((a, b) => {
                const indexA = statusOrder.indexOf(a.status);
                const indexB = statusOrder.indexOf(b.status);
                const safeIndexA = indexA === -1 ? statusOrder.length : indexA;
                const safeIndexB = indexB === -1 ? statusOrder.length : indexB;
                return sortOrder === 'asc' ? safeIndexA - safeIndexB : safeIndexB - safeIndexA;
            });
        }
        return ordersCopy;
    };
    const sortedOrders = sortOrders(orders);

    // 3. ОНОВЛЮЄМО функції скасування та видалення
    const handleCancelOrder = useCallback(async (orderId) => {
        if (!window.confirm('Ви дійсно хочете скасувати це замовлення?')) return;
        setError('');
        setMessage('');
        try {
            await cancelOrder(orderId); // Використовуємо центральну функцію
            setMessage('Замовлення успішно скасовано! ❌');
            // Оновлюємо статус локально для миттєвого відгуку
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: 'CANCELLED' } : order
                )
            );
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка при скасуванні замовлення.');
        }
    }, []);

    const handleDeleteOrder = useCallback(async (orderId) => {
        if (!window.confirm('Ви дійсно хочете видалити це замовлення? Цю дію не можна буде скасувати.')) return;
        setError('');
        setMessage('');
        try {
            await deleteOrder(orderId); // Використовуємо центральну функцію
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
                    <Spinner animation="border" role="status" className="mb-3" />
                    <p className="text-muted">Завантаження замовлень...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-5 bg-light">
            <Container className="bg-white p-4 p-md-5 rounded-3 shadow-sm">
                <h1 className="text-center mb-4 text-primary fw-bold">Мої Замовлення</h1>
                {/* ... ваша розмітка без змін ... */}
            </Container>
        </Container>
    );
};

export default OrdersPage;