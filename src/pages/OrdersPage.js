import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert, Spinner, Form } from 'react-bootstrap';

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

    // 2. СПРОЩЕНА ФУНКЦІЯ ЗАВАНТАЖЕННЯ. ТЕПЕР ТУТ ЛИШЕ ОДИН ЗАПИТ!
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
    }, []);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            setError('Будь ласка, увійдіть, щоб переглянути замовлення.');
            setLoading(false);
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [fetchOrders, navigate]);

    // Функція сортування (без змін, вона правильна)
    const sortOrders = (ordersToSort) => {
        const ordersCopy = [...ordersToSort];
        if (sortBy === 'date') {
            ordersCopy.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            if (sortOrder === 'asc') ordersCopy.reverse();
        } else if (sortBy === 'status') {
            const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PAID'];
            ordersCopy.sort((a, b) => {
                const indexA = statusOrder.indexOf(a.status);
                const indexB = statusOrder.indexOf(b.status);
                return sortOrder === 'asc' ? indexA - indexB : indexB - indexA;
            });
        }
        return ordersCopy;
    };
    const sortedOrders = sortOrders(orders);

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

                {orders.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                        <Button variant="outline-secondary" onClick={() => navigate('/')}>← До покупок</Button>
                        <div className="d-flex align-items-center gap-2">
                            <Form.Label htmlFor="sortBy" className="fw-semibold text-nowrap mb-0">Сортувати за:</Form.Label>
                            <Form.Select id="sortBy" size="sm" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 'auto' }}>
                                <option value="date">Датою</option>
                                <option value="status">Статусом</option>
                            </Form.Select>
                            <Form.Select id="sortOrder" size="sm" value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={{ width: 'auto' }}>
                                <option value="desc">За спаданням</option>
                                <option value="asc">За зростанням</option>
                            </Form.Select>
                        </div>
                    </div>
                )}

                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}

                {!loading && sortedOrders.length === 0 ? (
                    <div className="text-center py-5">
                        <p className="text-muted fs-5">У вас поки що немає замовлень. 😔</p>
                        <Button variant="primary" onClick={() => navigate('/')}>Перейти до покупок</Button>
                    </div>
                ) : (
                    <Row xs={1} lg={2} xl={3} className="g-4">
                        {sortedOrders.map(order => (
                            <Col key={order.id}>
                                <Card className="h-100 shadow-sm border-light">
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold">Замовлення #{order.id}</span>
                                        <span className={`badge ${order.status === 'CANCELLED' ? 'bg-danger' : order.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {order.status}
                                        </span>
                                    </Card.Header>
                                    <Card.Body>
                                        <Card.Text className="text-muted small mb-2">
                                            Дата: {new Date(order.orderDate).toLocaleString()}
                                        </Card.Text>
                                        <h6 className="mt-3">Товари:</h6>
                                        <Table striped bordered size="sm" className="mb-2">
                                            <tbody>
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map(item => (
                                                    <tr key={item.id}>
                                                        <td>{item.productName}</td>
                                                        <td className="text-end">{item.quantity} x {item.price.toFixed(2)}₴</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="text-center text-muted small">
                                                        (Немає інформації про товари)
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </Table>
                                        <h5 className="text-end text-dark mt-3">
                                            Всього: <span className="fw-bold text-primary">{order.total.toFixed(2)} ₴</span>
                                        </h5>
                                    </Card.Body>
                                    <Card.Footer className="d-grid gap-2">
                                        {order.status === 'PENDING' && (
                                            <div className="d-flex gap-2">
                                                <Button variant="success" size="sm" onClick={() => handlePayOrder(order.id, order.total)} className="flex-grow-1">Сплатити</Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleCancelOrder(order.id)} className="flex-grow-1">Скасувати</Button>
                                            </div>
                                        )}
                                        {order.status === 'CANCELLED' && (
                                            <Button variant="outline-secondary" size="sm" onClick={() => handleDeleteOrder(order.id)}>Видалити</Button>
                                        )}
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </Container>
    );
};

export default OrdersPage;