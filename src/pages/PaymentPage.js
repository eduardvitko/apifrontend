import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner } from 'react-bootstrap';

// 1. ІМПОРТУЄМО ВСІ ПОТРІБНІ ЦЕНТРАЛІЗОВАНІ ФУНКЦІЇ
import {
    fetchMyOrders,
    fetchUserAddresses,
    createAddress,
    fetchMyPayments,
    createPayment,
    updatePayment,
    deletePayment,
    markOrderAsPaid,
    updateOrderAddress
} from '../api';

const PaymentPage = () => {
    const [payments, setPayments] = useState([]);
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [paymentFormData, setPaymentFormData] = useState({ orderId: '', addressId: '', method: '', amount: '', paymentDate: '' });
    const [addressFormData, setAddressFormData] = useState({ country: '', city: '', street: '', houseNumber: '', apartmentNumber: '', postalCode: '', region: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const formRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Єдина функція для завантаження всіх даних
    const loadAllData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [paymentsRes, ordersRes, addressesRes] = await Promise.all([
                fetchMyPayments(),
                fetchMyOrders(),
                fetchUserAddresses()
            ]);
            setPayments(paymentsRes.data);
            setOrders(ordersRes.data);
            setAddresses(addressesRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Не вдалося завантажити дані.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            setError('Будь ласка, увійдіть, щоб керувати платежами.');
            setLoading(false);
            navigate('/login');
            return;
        }
        loadAllData();
    }, [loadAllData, navigate]);

    // Ефект для авто-заповнення форми
    useEffect(() => {
        if (location.state?.orderId) {
            const { orderId, amount } = location.state;
            setPaymentFormData(prev => ({
                ...prev,
                orderId: orderId.toString(),
                amount: amount ? amount.toFixed(2).toString() : '',
            }));
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location.state]);

    // 2. ВИПРАВЛЕНИЙ ОБРОБНИК ЗМІН У ФОРМІ
    const handlePaymentInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentFormData(prev => ({ ...prev, [name]: value }));

        // ДОДАТКОВА ЛОГІКА: Якщо змінюється замовлення, автоматично оновлюємо суму
        if (name === 'orderId') {
            const selectedOrder = orders.find(o => o.id.toString() === value);
            if (selectedOrder) {
                setPaymentFormData(prev => ({
                    ...prev,
                    amount: selectedOrder.total.toFixed(2).toString()
                }));
            }
        }
    };

    // ... (решта ваших функцій: handleAddressSubmit, handlePaymentFormSubmit, handleDeletePayment, etc.)
    // Вони вже використовують централізовані функції і не потребують змін

    // --- JSX-розмітка з виправленням ---

    return (
        <Container fluid className="py-5 bg-light">
            <Container className="bg-white p-4 p-md-5 rounded-3 shadow-sm">
                <h1 className="text-center mb-5 text-primary fw-bold">Управління платежами</h1>
                {/* ... */}

                {/* Форма створення / редагування платежів */}
                <Card ref={formRef} className="mb-5 shadow-sm">
                    <Card.Header as="h5">{selectedPayment ? 'Редагувати платіж' : 'Створити новий платіж'}</Card.Header>
                    <Card.Body>
                        <Form onSubmit={handlePaymentFormSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="orderId">
                                        <Form.Label>Замовлення:</Form.Label>
                                        <Form.Select
                                            name="orderId"
                                            value={paymentFormData.orderId}
                                            // 3. ВИКОРИСТОВУЄМО ВИПРАВЛЕНИЙ ОБРОБНИК
                                            onChange={handlePaymentInputChange}
                                            required
                                        >
                                            <option value="">Виберіть замовлення</option>
                                            {/* Фільтруємо, щоб показувати тільки неоплачені замовлення */}
                                            {orders.filter(o => o.status === 'PENDING').map(order => (
                                                <option key={order.id} value={order.id}>
                                                    Замовлення #{order.id} (Сума: {order.total.toFixed(2)}₴)
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                {/* ... решта полів форми ... */}
                                {/* Наприклад, для суми: */}
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="amount">
                                        <Form.Label>Сума:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="amount"
                                            value={paymentFormData.amount}
                                            onChange={handlePaymentInputChange} // <-- І тут теж
                                            required
                                            readOnly // <-- Робимо поле тільки для читання, бо сума береться з замовлення
                                        />
                                    </Form.Group>
                                </Col>

                            </Row>
                            {/* ... кнопки форми ... */}
                        </Form>
                    </Card.Body>
                </Card>

                {/* ... решта сторінки ... */}
            </Container>
        </Container>
    );
};

export default PaymentPage;