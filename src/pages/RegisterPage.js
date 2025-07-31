import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap';

// Імпортуємо нашу централізовану функцію
import { registerUser } from '../api';

function RegisterPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Додано поле 'email' до початкового стану
    const [form, setForm] = useState({ username: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(''); // Додано для повідомлення про успіх

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            // 1. Викликаємо registerUser, який тепер повертає відповідь з токеном
            const response = await registerUser(form);

            // 2. Перевіряємо, чи є в відповіді токен
            if (response.data && response.data.token) {
                // 3. Зберігаємо токен в localStorage
                localStorage.setItem('token', response.data.token);

                // Сповіщаємо інші компоненти (наприклад, Navbar) про зміну статусу
                window.dispatchEvent(new Event("storage"));

                // Показуємо повідомлення про успіх
                setSuccessMessage("Реєстрація успішна! Зараз ви будете перенаправлені в профіль...");

                // 4. Перенаправляємо в профіль через 2 секунди
                setTimeout(() => {
                    navigate('/profile');
                }, 2000);
            } else {
                setError('Реєстрація пройшла, але не вдалося увійти в систему.');
            }

        } catch (err) {
            console.error("Помилка реєстрації:", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(t('reg_server_error'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card className="shadow p-4" style={{ maxWidth: '500px', width: '100%' }}>
                <Card.Body>
                    <h3 className="mb-4 text-center">📝 {t('reg_title')}</h3>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}

                    <Form onSubmit={handleSubmit} noValidate>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('reg_field_username')}</Form.Label>
                            <Form.Control
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                        </Form.Group>

                        {/* ↓↓↓ Додано повний набір полів форми ↓↓↓ */}
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder="example@mail.com"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('reg_field_phone')}</Form.Label>
                            <Form.Control
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+380..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('reg_field_password')}</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        {/* ↑↑↑ Кінець полів форми ↑↑↑ */}

                        <Button className="w-100" type="submit" disabled={loading || successMessage}>
                            {loading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                                    <span className="ms-2">{t('reg_processing')}...</span>
                                </>
                            ) : t('reg_button')}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default RegisterPage;