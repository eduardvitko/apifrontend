import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
    const { t } = useTranslation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) {
                setError(t('profile_unauthorized'));
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
                setError(t('profile_load_error'));
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [t]);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3">{t('profile_loading')}</p>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger mt-4 text-center">{error}</div>;
    }

    const isAdmin = profile.roles?.includes('ADMIN');

    return (
        <div className="container mt-5" style={{ maxWidth: '600px' }}>
            <div className="card shadow">
                <div className="card-body">
                    <h4 className="card-title mb-4 text-center">👤 {t('profile_title')}</h4>

                    <ul className="list-group mb-4">
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                            <strong>{t('profile_username')}:</strong> <span>{profile.username}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                            <strong>{t('profile_phone')}:</strong> <span>{profile.phone}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                            <strong>{t('profile_roles')}:</strong>
                            <span>
                                {profile.roles?.map(role => (
                                    <span key={role} className="badge bg-secondary ms-2">{role}</span>
                                ))}
                            </span>
                        </li>
                    </ul>

                    <div className="d-flex flex-wrap gap-3 justify-content-center">
                        <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                            📦 {t('profile_orders')}
                        </button>

                        {isAdmin && (
                            <button className="btn btn-warning" onClick={() => navigate('/admin')}>
                                ⚙️ {t('profile_admin_panel')}
                            </button>
                        )}

                        <button className="btn btn-outline-danger" onClick={() => {
                            localStorage.removeItem('jwt');
                            navigate('/login');
                        }}>
                            🚪 {t('profile_logout')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
