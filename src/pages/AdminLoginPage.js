import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username,
                password
            });

            const { token, role } = response.data;
            localStorage.setItem('token', token);

            if (role === 'ADMIN') {
                navigate('/admin');
            } else {
                setError('Доступ заборонено: ви не адміністратор');
            }
        } catch (err) {
            setError('Невірний логін або пароль');
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow">
                <div className="card-header bg-primary text-white">
                    <h4>Вхід до адмін-панелі</h4>
                </div>
                <div className="card-body">
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label">Логін</label>
                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Пароль</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <button type="submit" className="btn btn-primary">Увійти</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
