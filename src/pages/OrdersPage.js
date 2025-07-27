import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert, Spinner } from 'react-bootstrap';

// Імпортуємо централізовані функції, як і раніше
import { fetchUserProfile, fetchOrdersByUserId, cancelOrder, deleteOrder } from '../api';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const userResponse = await fetchUserProfile();
            const userId = userResponse.data.id;
            const ordersResponse = await fetchOrdersByUserId(userId);
            setOrders(ordersResponse.data);
        } catch (err) {
            console.error("Помилка завантаження замовлень:", err);
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

    // Функція сортування. Вона використовує правильні назви полів з вашого DTO.
    const sortOrders = (ordersToSort) => {
        const ordersCopy = [...ordersToSort];
        if (sortBy === 'date') {
            ordersCopy.sort((a, b) => {
                const dateA = a.orderDate ? new Date(a.orderDate) : 0;
                const dateB = b.orderDate ? new Date(b.orderDate) : 0;
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
        } else if (sortBy === 'status') {
            const statusOrder = ['PENDING', 'PROCESSING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
            ordersCopy.sort((a, b) => {
                const indexA = statusOrder.indexOf(a.status);
                const indexB = statusOrder.indexOf(b.status);
                return sortOrder === 'asc' ? indexA - indexB : indexB - indexA;
            });
        }
        return ordersCopy;
    };
    const sortedOrders = sortOrders(orders);

    // Функції дій з замовленнями
    const handleCancelOrder = useCallback(async (orderId) => {
        if (!window.confirm('Ви дійсно хочете скасувати це замовлення?')) return;
        try {
            await cancelOrder(orderId);
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
                {/* ... розмітка сортування, вона правильна ... */}

                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}

                {sortedOrders.length === 0 ? (
                    <p className="text-center text-muted fs-5">У вас поки що немає замовлень.</p>
                ) : (
                    <Row xs={1} lg={2} xl={3} className="g-4">
                        {/* 1. АДАПТУЄМО JSX ПІД ВАШ DTO З ПЕРЕВІРКАМИ */}
                        {sortedOrders.map(order => (
                            <Col key={order.id}> {/* <-- ВИКОРИСТОВУЄМО order.id */}
                                <Card className="h-100 shadow-sm border-light">
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold">Замовлення #{order.id || 'N/A'}</span> {/* <-- Додано перевірку */}
                                        <span className={`badge ${
                                            order.status === 'CANCELLED' ? 'bg-danger' :
                                                order.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'
                                        }`}>
                                            {order.status || 'Невідомо'} {/* <-- Додано перевірку */}
                                        </span>
                                    </Card.Header>
                                    <Card.Body>
                                        <Card.Text className="text-muted small mb-2">
                                            Дата: {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'Не вказано'} {/* <-- Додано перевірку */}
                                        </Card.Text>

                                        <h6 className="mt-3">Товари:</h6>
                                        <Table striped bordered size="sm" className="mb-2">
                                            <tbody>
                                            {/* Перевіряємо, чи існує масив товарів перед .map() */}
                                            {order.items && order.items.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.productName}</td>
                                                    <td className="text-end">{item.quantity} x {item.price.toFixed(2)}₴</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>

                                        <h5 className="text-end text-dark mt-3">
                                            Всього: <span className="fw-bold text-primary">{(order.total || 0).toFixed(2)} ₴</span> {/* <-- Додано перевірку */}
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