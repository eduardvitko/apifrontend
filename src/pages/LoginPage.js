import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Імпортуємо тільки потрібну нам функцію
import { loginUser } from '../api'; // Переконайтеся, що відносний шлях правильний

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
            // 1. Надсилаємо запит на логін
            const loginResponse = await loginUser({ username, password });

            // Перевіряємо, чи є токен у відповіді
            if (loginResponse.data && loginResponse.data.token) {
                const { token } = loginResponse.data;

                // 2. Зберігаємо токен у localStorage
                localStorage.setItem('token', token);
                window.dispatchEvent(new Event("storage"));

                // 3. *** ГОЛОВНА ЗМІНА ***
                //    Одразу перенаправляємо на сторінку профілю,
                //    не роблячи додаткового запиту для перевірки ролі.
                navigate('/profile');

            } else {
                // Якщо відповідь успішна, але не містить токену
                setError(t('login_error_no_token'));
            }

        } catch (err) {
            // Обробляємо помилки, що могли виникнути
            const errorMessage = err.response?.data?.message || err.response?.data || t('login_error');
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
