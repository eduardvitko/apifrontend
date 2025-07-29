import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert, Spinner } from 'react-bootstrap';

// 1. ІМПОРТУЄМО ОНОВЛЕНИЙ НАБІР ФУНКЦІЙ
import { fetchMyOrders, cancelOrder, deleteOrder } from '../api';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const navigate = useNavigate();

    // 2. СПРОЩУЄМО ФУНКЦІЮ ЗАВАНТАЖЕННЯ. ТЕПЕР ТУТ ЛИШЕ ОДИН ЗАПИТ!
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            // Робимо один ефективний запит. Бекенд сам визначить користувача за токеном.
            const response = await fetchMyOrders();
            setOrders(response.data);
        } catch (err) {
            console.error("Помилка завантаження замовлень:", err);
            // Глобальний перехоплювач в api.js сам обробить помилки авторизації
            setError(err.response?.data?.message || 'Помилка мережі або сервера.');
        } finally {
            setLoading(false);
        }
    }, []); // Залежностей більше немає, функція повністю самодостатня

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            setError('Будь ласка, увійдіть, щоб переглянути замовлення.');
            setLoading(false);
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [fetchOrders, navigate]);

    // ... (решта коду: sortOrders, handleCancelOrder, handleDeleteOrder, JSX - залишається без змін,
    // оскільки він вже був добре написаний і тепер буде працювати з більш простою логікою завантаження)

    const sortOrders = (ordersToSort) => { /* ... ваш код сортування ... */ };
    const sortedOrders = sortOrders(orders);

    const handleCancelOrder = useCallback(async (orderId) => { /* ... */ }, [fetchOrders]);
    const handleDeleteOrder = useCallback(async (orderId) => { /* ... */ }, []);
    const handlePayOrder = (orderId, orderTotal) => { /* ... */ };

    if (loading) { /* ... ваш лоадер ... */ }

    return (
        <Container fluid className="py-5 bg-light">
            <Container className="bg-white p-4 p-md-5 rounded-3 shadow-sm">
                <h1 className="text-center mb-4 text-primary fw-bold">Мої Замовлення</h1>
                {/* ... ваша JSX розмітка без змін, вона правильна ... */}
            </Container>
        </Container>
    );
};

export default OrdersPage;