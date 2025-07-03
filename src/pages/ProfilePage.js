import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) {
                setError('Not authenticated');
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get('http://localhost:8080/api/user/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    },
                });

                setProfile(res.data);
            } catch (err) {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger mt-4 text-center">{error}</div>;
    }

    // Перевірка, чи є у користувача роль ADMIN
    const isAdmin = profile.roles?.includes('ADMIN');

    return (
        <div className="container mt-5" style={{ maxWidth: '600px' }}>
            <h3 className="mb-4">Welcome, {profile.username}</h3>
            <ul className="list-group">
                <li className="list-group-item"><strong>Phone:</strong> {profile.phone}</li>
                <li className="list-group-item">
                    <strong>Roles:</strong>
                    {profile.roles?.map(role => (
                        <span key={role} className="badge bg-secondary ms-2">{role}</span>
                    ))}
                </li>
            </ul>
            <div className="mt-4 d-flex gap-3 flex-wrap">
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/orders')}
                >
                    Мої замовлення
                </button>

                {isAdmin && (
                    <button
                        className="btn btn-warning"
                        onClick={() => navigate('/admin')}
                    >
                        Адмін панель
                    </button>
                )}

                <button
                    className="btn btn-outline-danger"
                    onClick={() => {
                        localStorage.removeItem('jwt');
                        navigate('/login');
                    }}
                >
                    Вийти
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
