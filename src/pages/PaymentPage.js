import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner } from 'react-bootstrap';

export const API_ENDPOINTS = {
    BASE_URL: 'http://localhost:8080/api',
    PAYMENTS: 'http://localhost:8080/api/payments',
    ORDERS: 'http://localhost:8080/api/orders',
    USER_ME: 'http://localhost:8080/api/user/me',
    ADDRESSES: 'http://localhost:8080/api/addresses',
};

const PaymentPage = () => {
    const [allPayments, setAllPayments] = useState([]);
    const [userOrders, setUserOrders] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [formData, setFormData] = useState({
        orderId: '',
        paymentDate: '',
        amount: '',
        method: ''
    });
    const [addressFormData, setAddressFormData] = useState({
        country: '',
        city: '',
        street: '',
        houseNumber: '',
        apartmentNumber: '',
        postalCode: '',
        region: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const formRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('jwt');
    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        }
    });

    const loadAllData = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        const token = getToken();

        if (!token) {
            setError('Будь ласка, увійдіть, щоб керувати платежами. Токен JWT відсутній.');
            setLoading(false);
            return;
        }

        try {
            const userRes = await axios.get(API_ENDPOINTS.USER_ME, getAuthHeaders());
            const userId = userRes.data.id;

            const paymentsRes = await axios.get(API_ENDPOINTS.PAYMENTS, getAuthHeaders());
            setAllPayments(paymentsRes.data);

            const ordersRes = await axios.get(`${API_ENDPOINTS.ORDERS}/user/${userId}`, getAuthHeaders());
            setUserOrders(ordersRes.data);

        } catch (err) {
            console.error('Помилка завантаження даних:', err);
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setError('Неавторизований доступ. Переконайтеся, що ви увійшли. Можливо, сесія закінчилася.');
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
        loadAllData();

        if (location.state && location.state.orderId) {
            const { orderId, amount } = location.state;
            setFormData(prev => ({
                ...prev,
                orderId: orderId.toString(),
                amount: amount ? amount.toFixed(2).toString() : '',
                paymentDate: ''
            }));
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [location.state]);

    // --- Платіжна форма ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const token = getToken();
        if (!token) {
            setError('Токен JWT відсутній. Будь ласка, увійдіть.');
            return;
        }

        try {
            const dataToSend = {
                ...formData,
                orderId: parseInt(formData.orderId, 10),
                amount: parseFloat(formData.amount),
                method: formData.method.toUpperCase(),
                paymentDate: formData.paymentDate ? formData.paymentDate : null
            };

            const res = await axios.post(API_ENDPOINTS.PAYMENTS, dataToSend, getAuthHeaders());
            setAllPayments(prev => [...prev, res.data]);
            setMessage('Платіж успішно створено! ✅');

            const orderIdToUpdate = parseInt(formData.orderId, 10);
            try {
                await axios.put(
                    `${API_ENDPOINTS.ORDERS}/${orderIdToUpdate}/pay`,
                    {},
                    getAuthHeaders()
                );
                loadAllData();
            } catch (orderUpdateErr) {
                console.error('Помилка оновлення статусу замовлення на PAID після оплати:', orderUpdateErr);
                setError(prev => prev + ' (Але не вдалося оновити статус замовлення на бекенді на PAID).');
            }

            setFormData({ orderId: '', paymentDate: '', amount: '', method: '' });

        } catch (err) {
            console.error('Помилка створення платежу:', err);
            if (err.response) {
                setError(`Помилка створення: ${err.response.status} - ${err.response.data.message || err.response.statusText}`);
            } else {
                setError('Помилка мережі або сервера при створенні платежу.');
            }
        }
    };

    const handleEditClick = (payment) => {
        setSelectedPayment(payment);
        const formattedDate = payment.paymentDate ? new Date(payment.paymentDate).toISOString().substring(0, 16) : '';
        setFormData({
            orderId: payment.orderId.toString(),
            paymentDate: formattedDate,
            amount: payment.amount.toString(),
            method: payment.method
        });
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!selectedPayment) return;

        const token = getToken();
        if (!token) {
            setError('Токен JWT відсутній. Будь ласка, увійдіть.');
            return;
        }

        try {
            const dataToSend = {
                ...formData,
                id: selectedPayment.id,
                orderId: parseInt(formData.orderId, 10),
                amount: parseFloat(formData.amount),
                method: formData.method.toUpperCase(),
                paymentDate: formData.paymentDate ? formData.paymentDate : null
            };

            const res = await axios.put(`${API_ENDPOINTS.PAYMENTS}/${selectedPayment.id}`, dataToSend, getAuthHeaders());
            setAllPayments(prev => prev.map(p => (p.id === selectedPayment.id ? res.data : p)));
            setMessage('Платіж успішно оновлено! ✅');
            setSelectedPayment(null);
            setFormData({ orderId: '', paymentDate: '', amount: '', method: '' });
            loadAllData();
        } catch (err) {
            console.error('Помилка оновлення платежу:', err);
            if (err.response) {
                setError(`Помилка оновлення: ${err.response.status} - ${err.response.data.message || err.response.statusText}`);
            } else {
                setError('Помилка мережі або сервера при оновленні платежу.');
            }
        }
    };

    const handleDeletePayment = async (id) => {
        setError('');
        setMessage('');

        const token = getToken();
        if (!token) {
            setError('Токен JWT відсутній. Будь ласка, увійдіть.');
            return;
        }

        if (window.confirm('Ви впевнені, що хочете видалити цей платіж? Цю дію може змінити статус замовлення.')) {
            try {
                await axios.delete(`${API_ENDPOINTS.PAYMENTS}/${id}`, getAuthHeaders());
                setAllPayments(prev => prev.filter(p => p.id !== id));
                setMessage('Платіж успішно видалено! 🗑️');
                loadAllData();
            } catch (err) {
                console.error('Помилка видалення платежу:', err);
                if (err.response) {
                    setError(`Помилка видалення: ${err.response.status} - ${err.response.data.message || err.response.statusText}`);
                } else {
                    setError('Помилка мережі або сервера при видаленні платежу.');
                }
            }
        }
    };

    const handlePayForOrderClick = (orderId, orderTotal) => {
        setSelectedPayment(null);
        setFormData({
            orderId: orderId.toString(),
            paymentDate: '',
            amount: orderTotal ? orderTotal.toFixed(2).toString() : '',
            method: ''
        });
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // --- Адресна форма ---
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateAddress = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const token = getToken();
        if (!token) {
            setError('Будь ласка, увійдіть, щоб додати адресу.');
            return;
        }

        try {
            const userRes = await axios.get(API_ENDPOINTS.USER_ME, getAuthHeaders());
            const userId = userRes.data.id;

            const addressToSend = {
                ...addressFormData,
                userId
            };

            await axios.post(API_ENDPOINTS.ADDRESSES, addressToSend, getAuthHeaders());

            setMessage('Адресу успішно збережено! 🏠');
            setAddressFormData({
                country: '',
                city: '',
                street: '',
                houseNumber: '',
                apartmentNumber: '',
                postalCode: '',
                region: ''
            });

        } catch (err) {
            console.error('Помилка створення адреси:', err);
            setError('Не вдалося створити адресу. Перевірте введені дані або спробуйте пізніше.');
        }
    };

    // --- Фільтри платежів ---
    const currentUserOrderIds = new Set(userOrders.map(order => order.id));
    const unpaidOrders = userOrders.filter(order => order.status === 'PENDING');
    const userPayments = allPayments.filter(payment =>
        currentUserOrderIds.has(payment.orderId)
    );

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <div className="text-center">
                    <Spinner animation="border" role="status" className="mb-3" />
                    <p className="text-muted">Завантаження даних...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-5 bg-light">
            <Container className="bg-white p-5 rounded-3 shadow border">
                <h1 className="text-center mb-5 text-primary fw-bold">Управління платежами</h1>
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

                {/* Замовлення, що очікують оплати */}
                <Card className="mb-5 p-4 border-primary bg-primary bg-opacity-10 shadow">
                    <Card.Body>
                        <h2 className="text-center mb-4 text-primary">Замовлення, що очікують оплати (Ваші)</h2>
                        {unpaidOrders.length === 0 ? (
                            <p className="text-center text-muted">
                                Наразі немає ваших замовлень, що очікують оплати. Чудова робота! 🎉
                            </p>
                        ) : (
                            <Row xs={1} md={2} lg={3} className="g-4">
                                {unpaidOrders.map(order => (
                                    <Col key={order.id}>
                                        <Card className="h-100 shadow-sm border-light transform-hover">
                                            <Card.Body>
                                                <Card.Title className="text-dark mb-3">Замовлення #{order.id}</Card.Title>
                                                <Card.Text className="text-muted mb-2">
                                                    Сума:{' '}
                                                    <span className="fw-bold text-success fs-5">
                                                        {order.total ? order.total.toFixed(2) : 'N/A'} ₴
                                                    </span>
                                                </Card.Text>
                                                <Card.Text className="text-muted mb-4">
                                                    Статус:{' '}
                                                    <span className="fw-medium text-warning">{order.status}</span>
                                                </Card.Text>
                                                <Button
                                                    onClick={() => handlePayForOrderClick(order.id, order.total)}
                                                    variant="success"
                                                    className="w-100 mt-3"
                                                >
                                                    Сплатити
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Card.Body>
                </Card>

                {/* Форма створення / редагування платежів */}
                <Card ref={formRef} className="mb-5 p-4 border-secondary bg-secondary bg-opacity-10 shadow">
                    <Card.Body>
                        <h2 className="text-center mb-4 text-secondary">
                            {selectedPayment ? 'Редагувати платіж' : 'Створити новий платіж'}
                        </h2>
                        <Form onSubmit={selectedPayment ? handleUpdatePayment : handleCreatePayment}>
                            <Row className="g-4">
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="orderId">
                                        <Form.Label>Замовлення:</Form.Label>
                                        <Form.Select
                                            name="orderId"
                                            value={formData.orderId}
                                            onChange={handleInputChange}
                                            required
                                            className="shadow-sm"
                                        >
                                            <option value="">Виберіть замовлення</option>
                                            {userOrders.map(order => (
                                                <option key={order.id} value={order.id}>
                                                    Замовлення #{order.id}{' '}
                                                    {order.description ? ` - ${order.description}` : ''} (Статус:{' '}
                                                    {order.status})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="amount">
                                        <Form.Label>Сума:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            required
                                            className="shadow-sm"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="method">
                                        <Form.Label>Метод оплати:</Form.Label>
                                        <Form.Select
                                            name="method"
                                            value={formData.method}
                                            onChange={handleInputChange}
                                            required
                                            className="shadow-sm"
                                        >
                                            <option value="">Виберіть метод</option>
                                            <option value="CREDIT_CARD">Кредитна картка</option>
                                            <option value="PAYPAL">PayPal</option>
                                            <option value="BANK_TRANSFER">Банківський переказ</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="paymentDate">
                                        <Form.Label>Дата платежу (необов'язково):</Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            name="paymentDate"
                                            value={formData.paymentDate}
                                            onChange={handleInputChange}
                                            className="shadow-sm"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
                                    <Button type="submit" variant="secondary" className="px-5 py-3 fw-bold">
                                        {selectedPayment ? 'Оновити платіж' : 'Створити платіж'}
                                    </Button>
                                    {selectedPayment && (
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => {
                                                setSelectedPayment(null);
                                                setFormData({ orderId: '', paymentDate: '', amount: '', method: '' });
                                            }}
                                            className="px-5 py-3 fw-bold"
                                        >
                                            Скасувати
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Форма створення адреси доставки */}
                <Card className="mb-5 p-4 border-info bg-info bg-opacity-10 shadow">
                    <Card.Body>
                        <h2 className="text-center mb-4 text-info">Додати адресу доставки</h2>
                        <Form onSubmit={handleCreateAddress}>
                            <Row className="g-4">
                                <Col md={6}>
                                    <Form.Group controlId="country">
                                        <Form.Label>Країна</Form.Label>
                                        <Form.Control
                                            name="country"
                                            value={addressFormData.country}
                                            onChange={handleAddressChange}
                                            required
                                            placeholder="Україна"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="city">
                                        <Form.Label>Місто</Form.Label>
                                        <Form.Control
                                            name="city"
                                            value={addressFormData.city}
                                            onChange={handleAddressChange}
                                            required
                                            placeholder="Київ"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="street">
                                        <Form.Label>Вулиця</Form.Label>
                                        <Form.Control
                                            name="street"
                                            value={addressFormData.street}
                                            onChange={handleAddressChange}
                                            required
                                            placeholder="вул. Хрещатик"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="houseNumber">
                                        <Form.Label>Будинок</Form.Label>
                                        <Form.Control
                                            name="houseNumber"
                                            value={addressFormData.houseNumber}
                                            onChange={handleAddressChange}
                                            required
                                            placeholder="12"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="apartmentNumber">
                                        <Form.Label>Квартира</Form.Label>
                                        <Form.Control
                                            name="apartmentNumber"
                                            value={addressFormData.apartmentNumber}
                                            onChange={handleAddressChange}
                                            placeholder="34"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="postalCode">
                                        <Form.Label>Поштовий індекс</Form.Label>
                                        <Form.Control
                                            name="postalCode"
                                            value={addressFormData.postalCode}
                                            onChange={handleAddressChange}
                                            required
                                            placeholder="01001"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={8}>
                                    <Form.Group controlId="region">
                                        <Form.Label>Область / Регіон</Form.Label>
                                        <Form.Control
                                            name="region"
                                            value={addressFormData.region}
                                            onChange={handleAddressChange}
                                            placeholder="Київська область"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} className="d-flex justify-content-center mt-4">
                                    <Button type="submit" variant="info" className="px-5 py-3 fw-bold">
                                        Зберегти адресу
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Таблиця всіх платежів користувача */}
                <Card className="p-4 border-primary bg-primary bg-opacity-10 shadow">
                    <Card.Body>
                        <h2 className="text-center mb-4 text-primary">Ваші платежі</h2>
                        {userPayments.length === 0 ? (
                            <p className="text-center text-muted">Платежі відсутні.</p>
                        ) : (
                            <Table striped bordered hover responsive className="shadow-sm">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Замовлення</th>
                                    <th>Дата платежу</th>
                                    <th>Сума</th>
                                    <th>Метод</th>
                                    <th>Дії</th>
                                </tr>
                                </thead>
                                <tbody>
                                {userPayments.map(payment => (
                                    <tr key={payment.id}>
                                        <td>{payment.id}</td>
                                        <td>{payment.orderId}</td>
                                        <td>
                                            {payment.paymentDate
                                                ? new Date(payment.paymentDate).toLocaleString()
                                                : '-'}
                                        </td>
                                        <td>{payment.amount.toFixed(2)} ₴</td>
                                        <td>{payment.method}</td>
                                        <td className="d-flex gap-2">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleEditClick(payment)}
                                            >
                                                Редагувати
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeletePayment(payment.id)}
                                            >
                                                Видалити
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </Container>
    );
};

export default PaymentPage;
