import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API = {
    USER_ME: 'http://localhost:8080/api/user/me',
    ALL_ORDERS: 'http://localhost:8080/api/admin/orders' // новий ендпоінт для адміна
};

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('jwt');
    const authHeaders = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    const loadData = async () => {
        setLoading(true);
        setError('');

        const token = getToken();
        if (!token) {
            setError('Токен JWT відсутній. Увійдіть для перегляду замовлень.');
            setLoading(false);
            return;
        }

        try {
            const userRes = await axios.get(API.USER_ME, authHeaders());
            const user = userRes.data;
            const roles = user.roles || [];
            if (!roles.includes('ADMIN')) {
                setError('Доступ заборонено. Ви не адміністратор.');
                setLoading(false);
                return;
            }
            setIsAdmin(true);

            const ordersRes = await axios.get(API.ALL_ORDERS, authHeaders());
            setOrders(ordersRes.data);
        } catch (err) {
            console.error('Помилка завантаження:', err);
            setError('Не вдалося завантажити замовлення. Спробуйте пізніше.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="secondary" onClick={() => navigate(-1)}>← Назад</Button>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="text-center mb-4">Усі замовлення користувачів</h1>
            <Button variant="secondary" onClick={() => navigate(-1)} className="mb-4">
                ← Назад
            </Button>

            {orders.length === 0 ? (
                <p className="text-muted">Замовлення відсутні.</p>
            ) : (
                <Row xs={1} md={2} lg={2} className="g-4">
                    {orders.map((order) => (
                        <Col key={order.id}>
                            <Card className="shadow-sm h-100">
                                <Card.Body>
                                    <Card.Title>Замовлення №{order.id}</Card.Title>
                                    <p><strong>Дата:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</p>
                                    <p><strong>Сума:</strong> {order.total?.toFixed(2)} ₴</p>
                                    <p><strong>Статус:</strong> {order.status}</p>

                                    <hr />
                                    <h6 className="text-primary">Користувач:</h6>
                                    {order.username ? (
                                        <>
                                            <p><strong>Ім’я:</strong> {order.username}</p>
                                            <p><strong>Телефон:</strong> {order.phone}</p>
                                            {/* Якщо email є, його теж можна показати, якщо він в DTO */}
                                            {order.email && <p><strong>Email:</strong> {order.email}</p>}
                                        </>
                                    ) : (
                                        <p className="text-muted">Немає інформації про користувача</p>
                                    )}


                                    <h6 className="text-primary">Адреса доставки:</h6>
                                    {order.address ? (
                                        <div>
                                            <div>{order.address.city}, {order.address.street} {order.address.houseNumber}</div>
                                            {order.address.apartmentNumber && <div>Квартира: {order.address.apartmentNumber}</div>}
                                            {order.address.region && <div>Регіон: {order.address.region}</div>}
                                            {order.address.postalCode && <div>Індекс: {order.address.postalCode}</div>}
                                            <div>Країна: {order.address.country}</div>
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
