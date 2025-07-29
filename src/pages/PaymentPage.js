import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner } from 'react-bootstrap';

// 1. ІМПОРТУЄМО АДАПТОВАНІ ЦЕНТРАЛІЗОВАНІ ФУНКЦІЇ//
import {
    fetchUserProfile,
    fetchOrdersByUserId,
    fetchUserAddresses,
    createAddress,
    fetchMyPayments, // Ця функція може потребувати адаптації на бекенді
    createPayment,
    updatePayment,
    deletePayment,
    markOrderAsPaid,
    updateOrderAddress
} from '../api';

const PaymentPage = () => {
    // --- Стани компонента ---
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

    // 2. ОНОВЛЕНА ФУНКЦІЯ ЗАВАНТАЖЕННЯ ДАНИХ З ДВОМА КРОКАМИ
    const loadAllData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const userResponse = await fetchUserProfile();
            const userId = userResponse.data.id;

            const [paymentsRes, ordersRes, addressesRes] = await Promise.all([
                fetchMyPayments(), // Може повернути помилку, якщо ендпоінт /my не існує
                fetchOrdersByUserId(userId),
                fetchUserAddresses(userId)
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

    // Обробник змін у формі платежу
    const handlePaymentInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'orderId' && value) {
            const selectedOrder = orders.find(o => o.id.toString() === value);
            if (selectedOrder) {
                setPaymentFormData(prev => ({
                    ...prev,
                    orderId: value,
                    amount: selectedOrder.total.toFixed(2).toString()
                }));
            }
        }
    };

    const handleAddressInputChange = (e) => {
        const { name, value } = e.target;
        setAddressFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setError('');
        try {
            const response = await createAddress(addressFormData);
            setAddresses(prev => [...prev, response.data]);
            setMessage('Адресу успішно додано! ✅');
            setAddressFormData({ country: '', city: '', street: '', houseNumber: '', apartmentNumber: '', postalCode: '', region: '' });
        } catch (err) { setError('Не вдалося додати адресу.'); }
    };

    const handlePaymentFormSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setError('');
        const dataToSend = {
            orderId: parseInt(paymentFormData.orderId),
            addressId: parseInt(paymentFormData.addressId),
            method: paymentFormData.method,
            amount: parseFloat(paymentFormData.amount),
            paymentDate: paymentFormData.paymentDate || null,
        };
        try {
            if (selectedPayment) {
                await updatePayment(selectedPayment.id, { ...dataToSend, id: selectedPayment.id });
                setMessage('Платіж успішно оновлено! ✅');
            } else {
                await createPayment(dataToSend);
                setMessage('Платіж успішно створено! ✅');
                await markOrderAsPaid(dataToSend.orderId);
                await updateOrderAddress(dataToSend.orderId, dataToSend.addressId);
            }
            setSelectedPayment(null);
            setPaymentFormData({ orderId: '', addressId: '', method: '', amount: '', paymentDate: '' });
            await loadAllData();
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка при збереженні платежу.');
        }
    };

    const handleDeletePayment = async (id) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей платіж?')) return;
        try {
            await deletePayment(id);
            setMessage('Платіж успішно видалено! 🗑️');
            setPayments(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            setError('Не вдалося видалити платіж.');
        }
    };

    const handleEditClick = (payment) => {
        setSelectedPayment(payment);
        setPaymentFormData({
            orderId: payment.orderId.toString(),
            addressId: payment.addressId?.toString() || '',
            method: payment.method || '',
            amount: payment.amount.toString(),
            paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().slice(0, 16) : '',
        });
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePayForOrderClick = (order) => {
        setSelectedPayment(null);
        setPaymentFormData({
            orderId: order.id.toString(),
            amount: order.total ? order.total.toFixed(2).toString() : '',
            addressId: '',
            method: '',
            paymentDate: ''
        });
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatAddressById = (id) => {
        if (!id) return '-';
        const addr = addresses.find(a => a.id === id);
        if (!addr) return 'Адреса не знайдена';
        return `${addr.city}, ${addr.street}`;
    };

    const unpaidOrders = orders.filter(order => order.status === 'PENDING');

    if (loading) {
        return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    }

    return (
        <Container fluid className="py-5 bg-light">
            <Container className="bg-white p-4 p-md-5 rounded-3 shadow-sm">
                <h1 className="text-center mb-5 text-primary fw-bold">Управління платежами</h1>
                <Button variant="outline-secondary" onClick={() => navigate(-1)} className="mb-4">← Назад</Button>

                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}

                <Card className="mb-5 shadow-sm">
                    <Card.Header as="h5">Додати нову адресу</Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleAddressSubmit}>
                            <Row>
                                <Col md={6}><Form.Control name="country" value={addressFormData.country} onChange={handleAddressInputChange} placeholder="Країна" required className="mb-2" /></Col>
                                <Col md={6}><Form.Control name="city" value={addressFormData.city} onChange={handleAddressInputChange} placeholder="Місто" required className="mb-2" /></Col>
                                <Col md={6}><Form.Control name="street" value={addressFormData.street} onChange={handleAddressInputChange} placeholder="Вулиця" required className="mb-2" /></Col>
                                <Col md={6}><Form.Control name="houseNumber" value={addressFormData.houseNumber} onChange={handleAddressInputChange} placeholder="Номер будинку" required className="mb-2" /></Col>
                            </Row>
                            <Button type="submit" variant="info" className="mt-2">Додати адресу</Button>
                        </Form>
                    </Card.Body>
                </Card>

                <Card ref={formRef} className="mb-5 shadow-sm">
                    <Card.Header as="h5">{selectedPayment ? 'Редагувати платіж' : 'Створити платіж'}</Card.Header>
                    <Card.Body>
                        <Form onSubmit={handlePaymentFormSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="orderIdSelect">
                                        <Form.Label>Замовлення:</Form.Label>
                                        <Form.Select name="orderId" value={paymentFormData.orderId} onChange={handlePaymentInputChange} required>
                                            <option value="">Виберіть неоплачене замовлення</option>
                                            {unpaidOrders.map(o => <option key={o.id} value={o.id}>Замовлення #{o.id} - {o.total.toFixed(2)}₴</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="addressIdSelect">
                                        <Form.Label>Адреса доставки:</Form.Label>
                                        <Form.Select name="addressId" value={paymentFormData.addressId} onChange={handlePaymentInputChange} required>
                                            <option value="">Виберіть адресу</option>
                                            {addresses.map(a => <option key={a.id} value={a.id}>{a.city}, {a.street}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="methodSelect">
                                        <Form.Label>Метод оплати:</Form.Label>
                                        <Form.Select name="method" value={paymentFormData.method} onChange={handlePaymentInputChange} required>
                                            <option value="">Виберіть метод</option>
                                            <option value="CREDIT_CARD">Кредитна карта</option>
                                            <option value="PAYPAL">PayPal</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="amountInput">
                                        <Form.Label>Сума:</Form.Label>
                                        <Form.Control name="amount" type="number" value={paymentFormData.amount} onChange={handlePaymentInputChange} placeholder="Сума" required readOnly />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="paymentDateInput">
                                        <Form.Label>Дата оплати:</Form.Label>
                                        <Form.Control name="paymentDate" type="datetime-local" value={paymentFormData.paymentDate} onChange={handlePaymentInputChange} />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Button type="submit">{selectedPayment ? 'Оновити' : 'Створити платіж'}</Button>
                            {selectedPayment && <Button variant="secondary" className="ms-2" onClick={() => { setSelectedPayment(null); setPaymentFormData({ orderId: '', addressId: '', method: '', amount: '', paymentDate: '' }); }}>Скасувати</Button>}
                        </Form>
                    </Card.Body>
                </Card>

                <h3 className="mt-5">Неоплачені замовлення</h3>
                {unpaidOrders.length === 0 ? <p>Неоплачені замовлення відсутні.</p> : (
                    <Table striped bordered hover responsive>
                        <thead><tr><th>ID</th><th>Сума</th><th>Статус</th><th>Дія</th></tr></thead>
                        <tbody>{unpaidOrders.map(order => <tr key={order.id}><td>{order.id}</td><td>{order.total.toFixed(2)}₴</td><td>{order.status}</td><td><Button size="sm" onClick={() => handlePayForOrderClick(order)}>Оплатити</Button></td></tr>)}</tbody>
                    </Table>
                )}

                <h3 className="mt-5">Історія платежів</h3>
                {payments.length === 0 ? <p>Історія платежів порожня.</p> : (
                    <Table striped bordered hover responsive>
                        <thead><tr><th>ID</th><th>Замовлення</th><th>Сума</th><th>Метод</th><th>Дата</th><th>Дії</th></tr></thead>
                        <tbody>{payments.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.orderId}</td><td>{p.amount.toFixed(2)}₴</td><td>{p.method}</td><td>{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : '-'}</td><td><Button size="sm" variant="primary" className="me-2" onClick={() => handleEditClick(p)}>Редагувати</Button><Button size="sm" variant="danger" onClick={() => handleDeletePayment(p.id)}>Видалити</Button></td></tr>)}</tbody>
                    </Table>
                )}
            </Container>
        </Container>
    );
};

export default PaymentPage;