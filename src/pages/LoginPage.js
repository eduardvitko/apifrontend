import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
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
            setError('❌ Невірний логін або пароль.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
                <h3 className="mb-4 text-center">🔐 Вхід</h3>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Логін</label>
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
                        <label htmlFor="password" className="form-label">Пароль</label>
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
                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                                Вхід...
                            </>
                        ) : 'Увійти'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
