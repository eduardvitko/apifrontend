import React from 'react'; // <-- ОСЬ ВИПРАВЛЕННЯ: прибрано зайву кому
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap';

// Імпортуємо нашу централізовану функцію
import { registerUser } from '../api';

function RegisterPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [form, setForm] = React.useState({ username: '', password: '', phone: '' });
    const [error, setError] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            await registerUser(form);
            setSuccessMessage(t('reg_success') + ' ' + t('reg_success_redirect'));

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error("Помилка реєстрації:", err);
            if (err.response && err.response.data && err.response.data.message) {
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

                    <Form onSubmit={handleSubmit}>
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