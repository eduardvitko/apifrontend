import React, from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // Імпортуємо useNavigate
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap';

// Імпортуємо нашу централізовану функцію
import { registerUser } from '../api';

function RegisterPage() {
    const { t } = useTranslation();
    const navigate = useNavigate(); // Створюємо екземпляр navigate

    const [form, setForm] = React.useState({ username: '', password: '', phone: '' });
    const [error, setError] = React.useState(''); // Єдиний стан для повідомлень про помилки
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

        // --- Валідація на фронтенді (залишається без змін) ---
        // Це добре, що вона є, вона зменшує кількість непотрібних запитів до сервера.
        const usernameRegex = /^[a-zA-Zа-яА-ЯіїєІЇЄґҐ' -]+$/;
        if (!usernameRegex.test(form.username)) {
            setError(t('reg_error_username'));
            setLoading(false);
            return;
        }
        // ... (можна додати й інші перевірки)

        try {
            await registerUser(form);
            setSuccessMessage(t('reg_success') + ' ' + t('reg_success_redirect'));

            // Після успішної реєстрації перенаправляємо на сторінку входу через 2 секунди
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error("Помилка реєстрації:", err);

            // ↓↓↓ ОСЬ КЛЮЧОВЕ ВИПРАВЛЕННЯ ↓↓↓
            // Тепер ми очікуємо чітке повідомлення про помилку з бекенда
            if (err.response && err.response.data && err.response.data.message) {
                // Якщо бекенд повернув помилку з полем 'message' (як наш ResponseStatusException)
                setError(err.response.data.message);
            } else {
                // Запасний варіант для інших типів помилок
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

                    {/* Повідомлення про помилку */}
                    {error && <Alert variant="danger">{error}</Alert>}

                    {/* Повідомлення про успіх */}
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