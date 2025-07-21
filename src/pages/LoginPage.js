import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// 1. Імпортуємо наш налаштований екземпляр 'api'
import api, { loginUser } from '../api'; // Переконайтеся, що шлях до файлу api.js правильний

const LoginPage = () => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 2. Використовуємо функцію loginUser з нашого api.js
            const response = await loginUser({
                username,
                password
            });

            // 3. Зберігаємо токен. Важливо, щоб ключ був однаковий всюди.
            //    Наш api.js шукає 'token', тому використовуємо 'token'.
            const { token } = response.data;
            localStorage.setItem('token', token);

            // 4. Отримуємо профіль користувача. Заголовок авторизації додасться автоматично!
            //    Наш перехоплювач в api.js зробить це за нас.
            const profileResponse = await api.get('/api/user/me'); // <-- Зверніть увагу на шлях

            const roles = profileResponse.data.roles;

            if (roles.includes('ADMIN')) {
                navigate('/admin');
            } else {
                navigate('/profile');
            }

        } catch (err) {
            // Виводимо більш детальну помилку, якщо вона є
            const errorMessage = err.response?.data?.message || t('login_error');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="container d-flex justify-content-center"
            style={{ height: 'auto', paddingTop: '100px' }}
        >
            <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
                <h3 className="mb-4 text-center">🔐 {t('login_title')}</h3>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">{t('login_username')}</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">{t('login_password')}</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {t('login_loading')}
                            </>
                        ) : t('login_button')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;