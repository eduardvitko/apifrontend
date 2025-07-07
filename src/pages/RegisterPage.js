import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registerUser } from '../api';

function RegisterPage() {
    const { t } = useTranslation();
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

        const usernameRegex = /^[a-zA-Zа-яА-ЯіїєІЇЄґҐ' -]+$/;
        const phoneRegex = /^(\+?\d{10,15})$/;

        const localErrors = [];
        if (!usernameRegex.test(form.username)) {
            localErrors.push({ field: t('reg_field_username'), message: t('reg_error_username') });
        }
        if (!phoneRegex.test(form.phone)) {
            localErrors.push({ field: t('reg_field_phone'), message: t('reg_error_phone') });
        }

        if (localErrors.length > 0) {
            setMessage(t('reg_form_error'));
            setErrorDetails(localErrors);
            return;
        }

        try {
            await registerUser(form);
            setMessage(t('reg_success'));
            setSuccess(true);
        } catch (err) {
            setSuccess(false);
            if (err.response?.data) {
                const error = err.response.data;
                if (typeof error === 'string') {
                    setMessage(error);
                } else if (typeof error === 'object') {
                    setMessage(error.error || t('reg_fail'));
                    setErrorDetails(error.errors || null);
                }
            } else {
                setMessage(t('reg_server_error'));
            }
        }
    };

    return (
        <div
            className="container d-flex justify-content-center align-items-start"
            style={{ paddingTop: '40px', paddingBottom: '40px', minHeight: '100vh' }}
        >
            <div className="card shadow p-4" style={{ maxWidth: '500px', width: '100%' }}>
                <h3 className="mb-4 text-center">📝 {t('reg_title')}</h3>

                {message && (
                    <div className={`alert ${success ? 'alert-success' : 'alert-danger'}`}>
                        <p className="mb-1">{message}</p>
                        {errorDetails && Array.isArray(errorDetails) && (
                            <ul className="mb-0 ps-3">
                                {errorDetails.map((err, idx) => (
                                    <li key={idx}>
                                        <strong>{err.field}</strong>: {err.message}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">{t('reg_field_username')}</label>
                        <input
                            className="form-control"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('reg_field_phone')}</label>
                        <input
                            className="form-control"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+380..."
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('reg_field_password')}</label>
                        <input
                            className="form-control"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button className="btn btn-primary w-100" type="submit">
                        {t('reg_button')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage;
