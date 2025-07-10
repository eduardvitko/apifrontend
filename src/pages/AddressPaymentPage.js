import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API = {
    USER_ME: 'http://localhost:8080/api/user/me',
    ADDRESSES: 'http://localhost:8080/api/addresses/user',
    ORDERS: 'http://localhost:8080/api/orders/user'
};

const AddressOrdersPage = () => {
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
            setError('Токен JWT відсутній. Увійдіть для перегляду адрес і замовлень.');
            setLoading(false);
            return;
        }

        try {
            const userRes = await axios.get(API.USER_ME, authHeaders());
            const userId = userRes.data.id;

            const [addrRes, ordRes] = await Promise.all([
                axios.get(`${API.ADDRESSES}/${userId}`, authHeaders()),
                axios.get(`${API.ORDERS}/` + userId, authHeaders())
            ]);

            setAddresses(addrRes.data);
            setOrders(ordRes.data);
        } catch (err) {
            console.error('Помилка завантаження:', err);
            setError('Не вдалося завантажити дані. Спробуйте пізніше.');
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

    return (
        <Container className="py-5">
            <h1 className="text-center mb-4">Адреси та замовлення</h1>
            <Button variant="secondary" onClick={() => navigate(-1)} className="mb-4">
                ← Назад
            </Button>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Адреси */}
            <Card className="mb-5 p-4 shadow-sm border-info">
                <Card.Body>
                    <h2 className="text-info mb-4">Ваші адреси</h2>
                    {addresses.length === 0 ? (
                        <p className="text-muted">Адреси відсутні.</p>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {addresses.map((addr) => (
                                <Col key={addr.id}>
                                    <Card className="h-100 shadow border-light">
                                        <Card.Body>
                                            <Card.Title>{addr.city}, {addr.street} {addr.houseNumber}</Card.Title>
                                            <Card.Text>
                                                {addr.region && <div>Регіон: {addr.region}</div>}
                                                {addr.postalCode && <div>Індекс: {addr.postalCode}</div>}
                                                {addr.apartmentNumber && <div>Квартира: {addr.apartmentNumber}</div>}
                                                <div>Країна: {addr.country}</div>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Card.Body>
            </Card>

            {/* Замовлення */}
            {/* Замовлення з адресами */}
            <Card className="p-4 shadow-sm border-primary">
                <Card.Body>
                    <h2 className="text-primary mb-4">Ваші замовлення</h2>
                    {orders.length === 0 ? (
                        <p className="text-muted">Замовлення відсутні.</p>
                    ) : (
                        <Table bordered hover responsive>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Дата</th>
                                <th>Сума</th>
                                <th>Статус</th>
                                <th>Адреса доставки</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
                                    <td>{order.total?.toFixed(2)} ₴</td>
                                    <td>{order.status}</td>
                                    <td>
                                        {order.address ? (
                                            <>
                                                {order.address.city}, {order.address.street} {order.address.houseNumber}
                                                {order.address.postalCode && `, ${order.address.postalCode}`}
                                                <br />
                                                {order.address.country}
                                            </>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

        </Container>
    );
};

export default AddressOrdersPage;
