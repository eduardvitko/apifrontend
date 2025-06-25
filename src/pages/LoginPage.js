import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

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
            setError('Invalid credentials. Try again.');
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '400px' }}>
            <h3 className="mb-4">Login</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;
