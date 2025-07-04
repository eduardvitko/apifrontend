import React, { useState } from 'react';
import { registerUser } from '../api';

function RegisterPage() {
    const [form, setForm] = useState({ username: '', password: '', phone: '' });
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [errorDetails, setErrorDetails] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess(false);
        setErrorDetails(null);

        // === Клієнтська валідація ===
        const usernameRegex = /^[a-zA-Zа-яА-ЯіїєІЇЄґҐ' -]+$/;
        const phoneRegex = /^(\+?\d{10,15})$/;

        const localErrors = [];
        if (!usernameRegex.test(form.username)) {
            localErrors.push({ field: 'username', message: 'Ім’я користувача має містити лише літери (укр/англ)' });
        }
        if (!phoneRegex.test(form.phone)) {
            localErrors.push({ field: 'phone', message: 'Телефон має містити лише цифри і може починатись з +' });
        }

        if (localErrors.length > 0) {
            setMessage('Форма містить помилки');
            setErrorDetails(localErrors);
            return;
        }

        // === Відправка на бекенд ===
        try {
            const res = await registerUser(form);
            setMessage('Реєстрація пройшла успішно');
            setSuccess(true);
        } catch (err) {
            setSuccess(false);
            if (err.response?.data) {
                const error = err.response.data;
                if (typeof error === 'string') {
                    setMessage(error);
                } else if (typeof error === 'object') {
                    setMessage(error.error || 'Помилка реєстрації');
                    setErrorDetails(error.errors || null);
                }
            } else {
                setMessage('Помилка з’єднання із сервером');
            }
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '500px' }}>
            <h2 className="mb-4 text-center">Register</h2>

            {message && (
                <div className={`alert ${success ? 'alert-success' : 'alert-danger'}`} role="alert">
                    <p>{message}</p>
                    {errorDetails && Array.isArray(errorDetails) && (
                        <ul className="mb-0">
                            {errorDetails.map((err, idx) => (
                                <li key={idx}>{err.field}: {err.message}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Username</label>
                    <input
                        className="form-control"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Phone</label>
                    <input
                        className="form-control"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Password</label>
                    <input
                        className="form-control"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button className="btn btn-primary w-100" type="submit">Register</button>
            </form>
        </div>
    );
}

export default RegisterPage;
