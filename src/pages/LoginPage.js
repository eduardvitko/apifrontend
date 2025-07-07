import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username,
                password
            });

            const { token } = response.data;
            localStorage.setItem('jwt', token);

            const profileResponse = await axios.get('http://localhost:8080/api/user/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const roles = profileResponse.data.roles;

            if (roles.includes('ADMIN')) {
                navigate('/admin');
            } else {
                navigate('/profile');
            }
        } catch (err) {
            setError(t('login_error'));
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
