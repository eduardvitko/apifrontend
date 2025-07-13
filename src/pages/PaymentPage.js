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
    const [addresses, setAddresses] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [formData, setFormData] = useState({
        orderId: '',
        paymentDate: '',
        amount: '',
        method: '',
        addressId: '',
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
    const updateOrderAddress = async (orderId, addressId) => {
        try {
            await axios.put(
                `${API_ENDPOINTS.ORDERS}/${orderId}/address/${addressId}`,
                {}, // без тіла
                getAuthHeaders()
            );
            setMessage(`Адресу замовлення #${orderId} оновлено`);
        } catch (err) {
            console.error('Помилка оновлення адреси замовлення:', err);
            setError('Не вдалося оновити адресу замовлення');
        }
    };


    // Форматування адреси за id
    const formatAddressById = (id) => {
        if (!id) return '-';
        const addr = addresses.find(a => a.id === id);
        if (!addr) return 'Адреса не знайдена';
        return `${addr.country}, ${addr.city}, ${addr.street}, ${addr.houseNumber}${addr.apartmentNumber ? `, кв. ${addr.apartmentNumber}` : ''}`;
    };

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

            // Виправлено: отримання адрес - GET, а не POST
            const addressesRes = await axios.get(`${API_ENDPOINTS.ADDRESSES}/user/${userId}`, getAuthHeaders());
            setAddresses(addressesRes.data);

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
                paymentDate: formData.paymentDate ? formData.paymentDate : null,
                addressId: formData.addressId ? parseInt(formData.addressId, 10) : null,
            };

            const res = await axios.post(API_ENDPOINTS.PAYMENTS, dataToSend, getAuthHeaders());
            setAllPayments(prev => [...prev, res.data]);
            setMessage('Платіж успішно створено! ✅');

            try {
                // ОНОВЛЕННЯ СТАТУСУ
                await axios.put(
                    `${API_ENDPOINTS.ORDERS}/${dataToSend.orderId}/pay`,
                    {},
                    getAuthHeaders()
                );

                // ОНОВЛЕННЯ АДРЕСИ ЗАМОВЛЕННЯ
                if (dataToSend.addressId) {
                    await updateOrderAddress(dataToSend.orderId, dataToSend.addressId);
                }

                loadAllData();
            } catch (orderUpdateErr) {
                console.error('Помилка оновлення статусу чи адреси:', orderUpdateErr);
                setError(prev => prev + ' (Не вдалося оновити статус або адресу замовлення).');
            }


            setFormData({ orderId: '', paymentDate: '', amount: '', method: '', addressId: '' });

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
            method: payment.method,
            addressId: payment.addressId ? payment.addressId.toString() : '',
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
                paymentDate: formData.paymentDate ? formData.paymentDate : null,
                addressId: formData.addressId ? parseInt(formData.addressId, 10) : null,
            };

            const res = await axios.put(`${API_ENDPOINTS.PAYMENTS}/${selectedPayment.id}`, dataToSend, getAuthHeaders());
            setAllPayments(prev => prev.map(p => (p.id === selectedPayment.id ? res.data : p)));
            setMessage('Платіж успішно оновлено! ✅');
            setSelectedPayment(null);
            setFormData({ orderId: '', paymentDate: '', amount: '', method: '', addressId: '' });
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
            method: '',
            addressId: '',
        });
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Фільтруємо платежі користувача
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

                {/* Форма створення адреси доставки */}
                <Card className="mb-5 p-4 border-info bg-info bg-opacity-10 shadow">
                    <Card.Body>
                        <h2 className="text-center mb-4 text-info">Додати нову адресу доставки</h2>
                        <Form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setError('');
                                setMessage('');
                                try {
                                    const token = getToken();
                                    if (!token) {
                                        setError('Токен JWT відсутній. Будь ласка, увійдіть.');
                                        return;
                                    }
                                    await axios.post(`${API_ENDPOINTS.ADDRESSES}/create/address`, addressFormData, getAuthHeaders());

                                    setMessage('Адресу успішно додано! ✅');
                                    setAddressFormData({
                                        country: '',
                                        city: '',
                                        street: '',
                                        houseNumber: '',
                                        apartmentNumber: '',
                                        postalCode: '',
                                        region: ''
                                    });
                                    loadAllData();
                                } catch (err) {
                                    console.error('Помилка додавання адреси:', err);
                                    setError('Не вдалося додати адресу. Спробуйте пізніше.');
                                }
                            }}
                        >
                            <Row className="g-4">
                                <Col md={6}>
                                    <Form.Group controlId="country" className="mb-3">
                                        <Form.Label>Країна</Form.Label>
                                        <Form.Control
                                            type="text"
                                            required
                                            value={addressFormData.country}
                                            onChange={(e) => setAddressFormData(prev => ({ ...prev, country: e.target.value }))}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="city" className="mb-3">
                                        <Form.Label>Місто</Form.Label>
                                        <Form.Control
                                            type="text"
                                            required
                                            value={addressFormData.city}
                                            onChange={(e) => setAddressFormData(prev => ({ ...prev, city: e.target.value }))}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="street" className="mb-3">
                                        <Form.Label>Вулиця</Form.Label>
                                        <Form.Control
                                            type="text"
                                            required
                                            value={addressFormData.street}
                                            onChange={(e) => setAddressFormData(prev => ({ ...prev, street: e.target.value }))}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="houseNumber" className="mb-3">
                                        <Form.Label>Номер будинку</Form.Label>
                                        <Form.Control
                                            type="text"
                                            required
                                            value={addressFormData.houseNumber}
                                            onChange={(e) => setAddressFormData(prev => ({ ...prev, houseNumber: e.target.value }))}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="apartmentNumber" className="mb-3">
                                        <Form.Label>Квартира (необов’язково)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={addressFormData.apartmentNumber}
                                            onChange={(e) => setAddressFormData(prev => ({ ...prev, apartmentNumber: e.target.value }))}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="postalCode" className="mb-3">
                                        <Form.Label>Поштовий індекс</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={addressFormData.postalCode}
                                            onChange={(e) => setAddressFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="region" className="mb-3">
                                        <Form.Label>Область / Регіон</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={addressFormData.region}
                                            onChange={(e) => setAddressFormData(prev => ({ ...prev, region: e.target.value }))}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} className="d-flex justify-content-center mt-3">
                                    <Button type="submit" variant="info" className="px-5 py-3 fw-bold">
                                        Додати адресу
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
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


                                    <Form.Group className="mb-3" controlId="addressId">
                                        <Form.Label>Адреса доставки:</Form.Label>
                                        <Form.Select
                                            name="addressId"
                                            value={formData.addressId}
                                            onChange={handleInputChange}
                                            required
                                            className="shadow-sm"
                                        >
                                            <option value="">Оберіть адресу</option>
                                            {addresses
                                                // Фільтрація валідних адрес, щоб не було порожніх
                                                .filter(addr =>
                                                    addr.country?.trim() !== '' &&
                                                    addr.city?.trim() !== '' &&
                                                    addr.street?.trim() !== '' &&
                                                    addr.houseNumber?.trim() !== ''
                                                )
                                                .map(addr => (
                                                    <option key={addr.id} value={addr.id}>
                                                        {addr.country}, {addr.city}, {addr.street}, {addr.houseNumber}
                                                        {addr.apartmentNumber ? `, кв. ${addr.apartmentNumber}` : ''}
                                                    </option>
                                                ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                    <Col md={6}>
                                    <Form.Group className="mb-3" controlId="paymentDate">
                                        <Form.Label>Дата оплати:</Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            name="paymentDate"
                                            value={formData.paymentDate}
                                            onChange={handleInputChange}
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
                                            <option value="CREDIT_CARD">Кредитна карта</option>
                                            <option value="PAYPAL">PayPal</option>
                                            <option value="BANK_TRANSFER">Банківський переказ</option>

                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="amount">
                                        <Form.Label>Сума:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="amount"
                                            min="0"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} className="d-flex justify-content-center mt-3">
                                    <Button type="submit" variant="secondary" className="px-5 py-3 fw-bold">
                                        {selectedPayment ? 'Оновити платіж' : 'Створити платіж'}
                                    </Button>
                                    {selectedPayment && (
                                        <Button
                                            variant="outline-secondary"
                                            className="ms-3 px-4 py-3 fw-bold"
                                            onClick={() => {
                                                setSelectedPayment(null);
                                                setFormData({ orderId: '', paymentDate: '', amount: '', method: '', addressId: '' });
                                            }}
                                        >
                                            Скасувати
                                        </Button>
                                    )}

                                </Col>

                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Таблиця платежів користувача */}
                <h3 className="text-center mb-4 text-primary">Ваші платежі</h3>
                {userPayments.length === 0 ? (
                    <p className="text-center text-muted">Платежі не знайдені.</p>
                ) : (
                    <Table striped bordered hover responsive>
                        <thead>
                        <tr>
                            <th>Платіж ID</th>
                            <th>Замовлення</th>
                            <th>Дата оплати</th>
                            <th>Метод</th>
                            <th>Сума</th>
                            <th>Адреса доставки</th>
                            <th>Дії</th>
                        </tr>
                        </thead>
                        <tbody>
                        {userPayments.map(payment => (
                            <tr key={payment.id}>
                                <td>{payment.id}</td>
                                <td>{payment.orderId}</td>
                                <td>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : '-'}</td>
                                <td>{payment.method}</td>
                                <td>{payment.amount.toFixed(2)}</td>
                                <td>{formatAddressById(payment.addressId)}</td>
                                <td>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleEditClick(payment)}
                                        className="me-2"
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

                {/* Список неоплачених замовлень */}
                <h3 className="text-center my-4 text-primary">Неоплачені замовлення</h3>
                {unpaidOrders.length === 0 ? (
                    <p className="text-center text-muted">Немає неоплачених замовлень.</p>
                ) : (
                    <Table striped bordered hover responsive>
                        <thead>
                        <tr>
                            <th>Замовлення ID</th>
                            <th>Опис</th>
                            <th>Статус</th>
                            <th>Загальна сума</th>
                            <th>Оплата</th>
                        </tr>
                        </thead>
                        <tbody>
                        {unpaidOrders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.description || '-'}</td>
                                <td>{order.status}</td>
                                <td>{order.totalAmount ? order.totalAmount.toFixed(2) : '-'}</td>
                                <td>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => handlePayForOrderClick(order.id, order.totalAmount)}
                                    >
                                        Оплатити
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
            </Container>
        </Container>
    );
};

export default PaymentPage;
