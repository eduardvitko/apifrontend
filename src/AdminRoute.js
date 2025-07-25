import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { fetchUserProfile } from './api'; // Імпортуємо нашу централізовану функцію

const AdminRoute = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                setError(true);
                return;
            }

            try {
                const response = await fetchUserProfile();
                const roles = response.data.roles;
                if (roles && roles.includes('ADMIN')) {
                    setIsAdmin(true);
                } else {
                    setError(true); // Користувач не адмін
                }
            } catch (err) {
                setError(true); // Помилка при отриманні профілю
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, []);

    if (loading) {
        return <div>Перевірка доступу...</div>; // Або краща заглушка-спіннер
    }

    // Якщо сталася помилка (немає токену, не адмін) - перенаправляємо на сторінку входу
    if (error || !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    // Якщо все добре, показуємо вкладений контент (ваші адмін-сторінки)
    return <Outlet />;
};

export default AdminRoute;