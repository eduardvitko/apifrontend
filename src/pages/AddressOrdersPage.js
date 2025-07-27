import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';

// 1. ІМПОРТУЄМО нашу централізовану адмінську функцію
import { fetchAllOrdersAdmin } from '../api';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 2. ВИДАЛЯЄМО зайві функції для ручного керування API
    // const getToken = ... // Не потрібно
    // const authHeaders = ... // Не потрібно

    // 3. СПРОЩУЄМО функцію завантаження даних
    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            // Робимо лише ОДИН запит. Бекенд сам перевірить, чи ми адмін.
            // Якщо ні, запит впаде в catch, і наш глобальний перехоплювач обробить помилку.
            const ordersRes = await fetchAllOrdersAdmin();
            setOrders(ordersRes.data);
        } catch (err) {
            console.error('Помилка завантаження:', err);
            // Показуємо користувачу помилку, якщо щось пішло не так
            setError(err.response?.data?.message || 'Не вдалося завантажити замовлення. Можливо, у вас недостатньо прав.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Перевірка наявності токена залишається корисною
        if (!localStorage.getItem('token')) {
            setError('Будь ласка, увійдіть як адміністратор.');
            setLoading(false);
            navigate('/admin/login');
            return;
        }
        loadData();
    }, [loadData, navigate]);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5 text-center">
                <Alert variant="danger">{error}</Alert>
                <Button variant="secondary" onClick={() => navigate('/admin')}>← Назад до адмін-панелі</Button>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="text-center mb-4">Усі замовлення користувачів</h1>
            <Button variant="secondary" onClick={() => navigate('/admin')} className="mb-4">
                ← Назад до адмін-панелі
            </Button>

            {orders.length === 0 ? (
                <p className="text-center text-muted">Замовлення відсутні.</p>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {orders.map((order) => (
                        <Col key={order.id}>
                            <Card className="shadow-sm h-100">
                                <Card.Header className="d-flex justify-content-between">
                                    <strong>Замовлення №{order.id}</strong>
                                    <span className={`badge bg-${order.status === 'CANCELLED' ? 'danger' : 'success'}`}>{order.status}</span>
                                </Card.Header>
                                <Card.Body>
                                    <p><strong>Дата:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</p>
                                    <p><strong>Сума:</strong> {order.total?.toFixed(2)} ₴</p>

                                    <hr />
                                    <h6 className="text-primary">Користувач:</h6>
                                    {order.username ? (
                                        <>
                                            <p className="mb-1"><strong>Ім’я:</strong> {order.username}</p>
                                            {order.phone && <p className="mb-1"><strong>Телефон:</strong> {order.phone}</p>}
                                            {order.email && <p className="mb-0"><strong>Email:</strong> {order.email}</p>}
                                        </>
                                    ) : (
                                        <p className="text-muted">Немає інформації про користувача</p>
                                    )}

                                    <h6 className="text-primary mt-3">Адреса доставки:</h6>
                                    {order.address ? (
                                        <div>
                                            <small>
                                                {order.address.country}, {order.address.postalCode}, {order.address.region}, {order.address.city}, {order.address.street} {order.address.houseNumber}
                                                {order.address.apartmentNumber && `, кв. ${order.address.apartmentNumber}`}
                                            </small>
                                        </div>
                                    ) : (
                                        <div className="text-muted">Адресу не вказано</div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default AdminOrdersPage;