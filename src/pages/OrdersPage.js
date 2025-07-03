import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert, Spinner } from 'react-bootstrap';

// Рекомендовано централізувати URL-адреси
// Приклад: src/config.js
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
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('jwt');

    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    // Функція для отримання замовлень (всіх замовлень поточного користувача)
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
            setOrders(ordersResponse.data); // Зберігаємо усі замовлення користувача

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
        fetchOrders(); // Завантажуємо замовлення при першому рендері сторінки
    }, [navigate]);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Ви дійсно хочете скасувати це замовлення?')) {
            return;
        }

        setError('');
        setMessage('');

        try {
            await axios.put(`${API_ENDPOINTS.ORDERS}/${orderId}/cancel`, {}, getAuthHeaders());
            setMessage('Замовлення успішно скасовано! ❌');

            // Оновлюємо статус в локальному стані, щоб зміни відобразилися миттєво
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
        if (!window.confirm('Ви дійсно хочете видалити це замовлення? Цю дію не можна буде скасувати.')) {
            return;
        }

        setError('');
        setMessage('');

        try {
            await axios.delete(`${API_ENDPOINTS.ORDERS}/delete/${orderId}`, getAuthHeaders());
            setMessage('Замовлення успішно видалено! 🗑️');

            // Видаляємо замовлення зі списку
            setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        } catch (err) {
            console.error('Помилка видалення замовлення:', err);
            setError(err.response?.data?.message || 'Помилка при видаленні замовлення.');
        }
    };

    const handlePayOrder = (orderId, orderTotal) => {
        // Перенаправляємо на сторінку платежів, передаючи дані замовлення через state
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
                <h1 className="text-center mb-5 text-primary fw-bold">
                    Мої Замовлення
                </h1>

                <Button variant="secondary" onClick={() => navigate(-1)} className="mb-4">
                    &#8592; Назад
                </Button>

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

                {orders.length === 0 ? (
                    <p className="text-center text-muted fs-5">
                        У вас поки що немає замовлень. 😔 Можливо, час щось замовити?
                    </p>
                ) : (
                    <Row xs={1} lg={2} className="g-4">
                        {orders.map(order => (
                            <Col key={order.id}>
                                <Card className="h-100 shadow-sm border-secondary transform-hover">
                                    <Card.Header className="bg-light text-dark fw-bold d-flex justify-content-between align-items-center">
                                        Замовлення #{order.id}
                                        <span className={`badge ${
                                            order.status === 'CANCELLED' ? 'bg-danger' :
                                                order.status === 'PAID' || order.status === 'COMPLETED' ? 'bg-success' : // Відображаємо PAID та COMPLETED як успішні
                                                    'bg-warning text-dark'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </Card.Header>
                                    <Card.Body>
                                        <Card.Text className="text-muted mb-2">
                                            Дата замовлення: {new Date(order.orderDate).toLocaleString()}
                                        </Card.Text>
                                        <h5 className="mb-3 text-dark">Деталі замовлення:</h5>
                                        <Table striped bordered hover size="sm">
                                            <thead>
                                            <tr>
                                                <th>Товар</th>
                                                <th>Кіл-ть</th>
                                                <th>Ціна</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {order.items && order.items.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.productName}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.price.toFixed(2)} ₴</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>
                                        <h4 className="text-end text-primary mt-3">
                                            Загальна сума: <span className="fw-bold">{order.total ? order.total.toFixed(2) : '0.00'} ₴</span>
                                        </h4>

                                        <div className="d-flex flex-column flex-md-row justify-content-end gap-2 mt-3">
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

                                            {/* Кнопка "Сплачено" тепер відображається для PAID та COMPLETED */}
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