import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert, Spinner } from 'react-bootstrap';

// Конфігурація API
export const API_ENDPOINTS = {
    BASE_URL: 'http://localhost:8080/api',
    PAYMENTS: 'http://localhost:8080/api/payments',
    ORDERS: 'http://localhost:8080/api/orders',
    USER_ME: 'http://localhost:8080/api/user/me',
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [sortBy, setSortBy] = useState('date'); // date або status
    const [sortOrder, setSortOrder] = useState('desc'); // asc або desc
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('jwt');

    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        const token = getToken();

        if (!token) {
            setError('Будь ласка, увійдіть, щоб переглянути замовлення. Токен JWT відсутній.');
            setLoading(false);
            return;
        }

        try {
            const userResponse = await axios.get(API_ENDPOINTS.USER_ME, getAuthHeaders());
            const userId = userResponse.data.id;

            const ordersResponse = await axios.get(`${API_ENDPOINTS.ORDERS}/user/${userId}`, getAuthHeaders());
            setOrders(ordersResponse.data);

        } catch (err) {
            console.error("Помилка завантаження замовлень:", err);
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setError('Сесія закінчилася або ви неавторизовані. Будь ласка, увійдіть знову.');
                    localStorage.removeItem('jwt');
                    navigate('/login');
                } else {
                    setError(`Помилка: ${err.response.status} - ${err.response.data.message || err.response.statusText}`);
                }
            } else {
                setError('Помилка мережі або сервера. Будь ласка, спробуйте пізніше.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [navigate]);

    // Функції сортування
    const sortOrders = (orders) => {
        const ordersCopy = [...orders];
        if (sortBy === 'date') {
            ordersCopy.sort((a, b) => {
                const dateA = new Date(a.orderDate);
                const dateB = new Date(b.orderDate);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
        } else if (sortBy === 'status') {
            // Приклад порядку статусів
            const statusOrder = ['PENDING', 'PAID', 'COMPLETED', 'CANCELLED'];
            ordersCopy.sort((a, b) => {
                const indexA = statusOrder.indexOf(a.status);
                const indexB = statusOrder.indexOf(b.status);
                return sortOrder === 'asc' ? indexA - indexB : indexB - indexA;
            });
        }
        return ordersCopy;
    };

    const sortedOrders = sortOrders(orders);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Ви дійсно хочете скасувати це замовлення?')) return;

        setError('');
        setMessage('');

        try {
            await axios.put(`${API_ENDPOINTS.ORDERS}/${orderId}/cancel`, {}, getAuthHeaders());
            setMessage('Замовлення успішно скасовано! ❌');

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: 'CANCELLED' } : order
                )
            );
        } catch (err) {
            console.error('Помилка скасування замовлення:', err);
            setError(err.response?.data?.message || 'Помилка при скасуванні замовлення.');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Ви дійсно хочете видалити це замовлення? Цю дію не можна буде скасувати.')) return;

        setError('');
        setMessage('');

        try {
            await axios.delete(`${API_ENDPOINTS.ORDERS}/delete/${orderId}`, getAuthHeaders());
            setMessage('Замовлення успішно видалено! 🗑️');

            setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        } catch (err) {
            console.error('Помилка видалення замовлення:', err);
            setError(err.response?.data?.message || 'Помилка при видаленні замовлення.');
        }
    };

    const handlePayOrder = (orderId, orderTotal) => {
        navigate('/payments', { state: { orderId, amount: orderTotal } });
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <div className="text-center">
                    <Spinner animation="border" role="status" className="mb-3" />
                    <p className="text-muted">Завантаження замовлень...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-5 bg-light">
            <Container className="bg-white p-5 rounded-3 shadow border">
                <h1 className="text-center mb-4 text-primary fw-bold">Мої Замовлення</h1>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        &#8592; Назад
                    </Button>

                    <div>
                        <label htmlFor="sortBy" className="me-2 fw-semibold">
                            Сортувати за:
                        </label>
                        <select
                            id="sortBy"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="form-select d-inline-block w-auto me-3"
                        >
                            <option value="date">Датою</option>
                            <option value="status">Статусом</option>
                        </select>

                        <select
                            id="sortOrder"
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value)}
                            className="form-select d-inline-block w-auto"
                        >
                            <option value="asc">За зростанням</option>
                            <option value="desc">За спаданням</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <Alert variant="danger" className="mb-4">
                        <strong>Помилка!</strong> {error}
                    </Alert>
                )}
                {message && (
                    <Alert variant="success" className="mb-4">
                        <strong>Успіх!</strong> {message}
                    </Alert>
                )}

                {sortedOrders.length === 0 ? (
                    <p className="text-center text-muted fs-5">
                        У вас поки що немає замовлень. 😔 Можливо, час щось замовити?
                    </p>
                ) : (
                    <Row xs={1} sm={2} md={3} lg={3} className="g-4">
                        {sortedOrders.map(order => (
                            <Col key={order.id}>
                                <Card
                                    className="h-100 shadow-sm border-secondary transform-hover"
                                    style={{ padding: '16px', fontSize: '1rem' }}
                                >
                                    <Card.Header
                                        className="bg-light text-dark fw-bold d-flex justify-content-between align-items-center"
                                        style={{ fontSize: '1.1rem', padding: '10px 16px' }}
                                    >
                                        Замовлення #{order.id}
                                        <span
                                            className={`badge ${
                                                order.status === 'CANCELLED'
                                                    ? 'bg-danger'
                                                    : order.status === 'PAID' || order.status === 'COMPLETED'
                                                        ? 'bg-success'
                                                        : 'bg-warning text-dark'
                                            }`}
                                        >
                                            {order.status}
                                        </span>
                                    </Card.Header>
                                    <Card.Body style={{ padding: '16px' }}>
                                        <Card.Text className="text-muted mb-3" style={{ fontSize: '0.95rem' }}>
                                            Дата замовлення: {new Date(order.orderDate).toLocaleString()}
                                        </Card.Text>
                                        <h5 className="mb-3 text-dark" style={{ fontSize: '1.1rem' }}>
                                            Деталі замовлення:
                                        </h5>
                                        <Table striped bordered hover size="sm" style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
                                            <thead>
                                            <tr>
                                                <th>Товар</th>
                                                <th>Кіл-ть</th>
                                                <th>Ціна</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {order.items &&
                                                order.items.map(item => (
                                                    <tr key={item.id}>
                                                        <td>{item.productName}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>{item.price.toFixed(2)} ₴</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                        <h4 className="text-end text-primary mt-3" style={{ fontSize: '1.1rem' }}>
                                            Загальна сума:{' '}
                                            <span className="fw-bold">{order.total ? order.total.toFixed(2) : '0.00'} ₴</span>
                                        </h4>

                                        <div className="d-flex flex-column flex-md-row justify-content-end gap-3 mt-3">
                                            {order.status === 'PENDING' && (
                                                <>
                                                    <Button
                                                        variant="success"
                                                        onClick={() => handlePayOrder(order.id, order.total)}
                                                        className="flex-grow-1 flex-md-grow-0"
                                                    >
                                                        Сплатити
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="flex-grow-1 flex-md-grow-0"
                                                    >
                                                        Скасувати
                                                    </Button>
                                                </>
                                            )}

                                            {(order.status === 'PAID' || order.status === 'COMPLETED') && (
                                                <Button variant="success" disabled className="flex-grow-1 flex-md-grow-0">
                                                    <i className="bi bi-check-circle me-2"></i> Сплачено
                                                </Button>
                                            )}

                                            {order.status === 'CANCELLED' && (
                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    className="flex-grow-1 flex-md-grow-0"
                                                >
                                                    Видалити замовлення
                                                </Button>
                                            )}
                                        </div>
                                    </Card.Body>
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
