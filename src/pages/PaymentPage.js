import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner } from 'react-bootstrap';

// 1. IMPORT all necessary centralized functions from api.js
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

    // 2. A SINGLE, EFFICIENT function to load all necessary data
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
            console.error('Error loading data:', err);
            setError(err.response?.data?.message || 'Failed to load page data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            setError('Please log in to manage payments.');
            setLoading(false);
            navigate('/login');
            return;
        }
        loadAllData();
    }, [loadAllData, navigate]);

    // Auto-fill form if coming from the orders page
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


    // 3. UPDATED event handlers using centralized API functions

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await createAddress(addressFormData);
            setAddresses(prev => [...prev, response.data]);
            setMessage('Address successfully added! ✅');
            setAddressFormData({ country: '', city: '', street: '', houseNumber: '', apartmentNumber: '', postalCode: '', region: '' });
        } catch (err) {
            setError('Failed to add address.');
        }
    };

    const handlePaymentFormSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const dataToSend = {
            orderId: parseInt(paymentFormData.orderId),
            addressId: parseInt(paymentFormData.addressId),
            method: paymentFormData.method.toUpperCase(),
            amount: parseFloat(paymentFormData.amount),
            paymentDate: paymentFormData.paymentDate || null,
        };

        try {
            if (selectedPayment) { // Update existing payment
                await updatePayment(selectedPayment.id, { ...dataToSend, id: selectedPayment.id });
                setMessage('Payment successfully updated! ✅');
            } else { // Create new payment
                await createPayment(dataToSend);
                setMessage('Payment successfully created! ✅');
                // After creating a payment, update the order status and address
                await markOrderAsPaid(dataToSend.orderId);
                await updateOrderAddress(dataToSend.orderId, dataToSend.addressId);
            }

            // Clear form and reload all data to be up-to-date
            setSelectedPayment(null);
            setPaymentFormData({ orderId: '', addressId: '', method: '', amount: '', paymentDate: '' });
            await loadAllData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving payment.');
        }
    };

    const handleDeletePayment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payment?')) return;
        try {
            await deletePayment(id);
            setMessage('Payment successfully deleted! 🗑️');
            setPayments(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            setError('Failed to delete payment.');
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

    // --- JSX Display Logic ---
    // This part is well-written and doesn't need many changes

    const unpaidOrders = orders.filter(order => order.status === 'PENDING');

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading data...</p>
            </Container>
        );
    }

    return (
        <Container fluid className="py-5 bg-light">
            <Container className="bg-white p-4 p-md-5 rounded-3 shadow-sm">
                <h1 className="text-center mb-5 text-primary fw-bold">Payment Management</h1>
                <Button variant="outline-secondary" onClick={() => navigate(-1)} className="mb-4">← Back</Button>

                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}

                {/* Add New Address Form */}
                <Card className="mb-5 shadow-sm">
                    <Card.Header as="h5">Add New Shipping Address</Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleAddressSubmit}>
                            <Row>
                                <Col md={6}><Form.Control name="country" value={addressFormData.country} onChange={(e) => setAddressFormData(prev => ({...prev, country: e.target.value}))} placeholder="Country" required className="mb-2" /></Col>
                                <Col md={6}><Form.Control name="city" value={addressFormData.city} onChange={(e) => setAddressFormData(prev => ({...prev, city: e.target.value}))} placeholder="City" required className="mb-2" /></Col>
                                <Col md={6}><Form.Control name="street" value={addressFormData.street} onChange={(e) => setAddressFormData(prev => ({...prev, street: e.target.value}))} placeholder="Street" required className="mb-2" /></Col>
                                <Col md={6}><Form.Control name="houseNumber" value={addressFormData.houseNumber} onChange={(e) => setAddressFormData(prev => ({...prev, houseNumber: e.target.value}))} placeholder="House Number" required className="mb-2" /></Col>
                            </Row>
                            <Button type="submit" variant="info" className="mt-2">Add Address</Button>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Create / Edit Payment Form */}
                <Card ref={formRef} className="mb-5 shadow-sm">
                    <Card.Header as="h5">{selectedPayment ? 'Edit Payment' : 'Create a New Payment'}</Card.Header>
                    <Card.Body>
                        <Form onSubmit={handlePaymentFormSubmit}>
                            <Row>
                                <Col md={6}><Form.Select name="orderId" value={paymentFormData.orderId} onChange={(e) => setPaymentFormData(prev => ({...prev, orderId: e.target.value}))} required className="mb-3"><option value="">Select Order</option>{orders.map(o => <option key={o.id} value={o.id}>Order #{o.id} - {o.total.toFixed(2)}₴</option>)}</Form.Select></Col>
                                <Col md={6}><Form.Select name="addressId" value={paymentFormData.addressId} onChange={(e) => setPaymentFormData(prev => ({...prev, addressId: e.target.value}))} required className="mb-3"><option value="">Select Address</option>{addresses.map(a => <option key={a.id} value={a.id}>{a.city}, {a.street}</option>)}</Form.Select></Col>
                                <Col md={6}><Form.Select name="method" value={paymentFormData.method} onChange={(e) => setPaymentFormData(prev => ({...prev, method: e.target.value}))} required className="mb-3"><option value="">Select Method</option><option value="CREDIT_CARD">Credit Card</option><option value="PAYPAL">PayPal</option></Form.Select></Col>
                                <Col md={6}><Form.Control name="amount" type="number" value={paymentFormData.amount} onChange={(e) => setPaymentFormData(prev => ({...prev, amount: e.target.value}))} placeholder="Amount" required className="mb-3" /></Col>
                                <Col md={6}><Form.Control name="paymentDate" type="datetime-local" value={paymentFormData.paymentDate} onChange={(e) => setPaymentFormData(prev => ({...prev, paymentDate: e.target.value}))} className="mb-3" /></Col>
                            </Row>
                            <Button type="submit">{selectedPayment ? 'Update Payment' : 'Create Payment'}</Button>
                            {selectedPayment && <Button variant="secondary" className="ms-2" onClick={() => { setSelectedPayment(null); setPaymentFormData({ orderId: '', addressId: '', method: '', amount: '', paymentDate: '' }); }}>Cancel</Button>}
                        </Form>
                    </Card.Body>
                </Card>

                {/* Unpaid Orders Table */}
                <h3 className="mt-5">Unpaid Orders</h3>
                {unpaidOrders.length === 0 ? <p>No unpaid orders found.</p> : (
                    <Table striped bordered hover responsive>
                        <thead><tr><th>Order ID</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>{unpaidOrders.map(order => <tr key={order.id}><td>{order.id}</td><td>{order.total.toFixed(2)}₴</td><td>{order.status}</td><td><Button size="sm" onClick={() => handlePayForOrderClick(order)}>Pay Now</Button></td></tr>)}</tbody>
                    </Table>
                )}

                {/* User Payments Table */}
                <h3 className="mt-5">Your Payments</h3>
                {payments.length === 0 ? <p>No payments found.</p> : (
                    <Table striped bordered hover responsive>
                        <thead><tr><th>ID</th><th>Order ID</th><th>Amount</th><th>Method</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>{payments.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.orderId}</td><td>{p.amount.toFixed(2)}₴</td><td>{p.method}</td><td>{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : '-'}</td><td><Button size="sm" variant="primary" className="me-2" onClick={() => handleEditClick(p)}>Edit</Button><Button size="sm" variant="danger" onClick={() => handleDeletePayment(p.id)}>Delete</Button></td></tr>)}</tbody>
                    </Table>
                )}
            </Container>
        </Container>
    );
};

export default PaymentPage;