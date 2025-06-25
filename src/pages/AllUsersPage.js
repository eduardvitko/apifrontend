import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwt');

        axios.get('http://localhost:8080/api/admin/users', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(res => {
                setUsers(res.data);
            })
            .catch(() => {
                setError('Доступ заборонено або не вдалося завантажити користувачів.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center mt-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Завантаження...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="alert alert-danger text-center mt-4" role="alert">
            {error}
        </div>
    );

    return (
        <div className="container mt-5">
            <div className="card shadow">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">Список усіх користувачів</h4>
                </div>
                <div className="card-body p-0">
                    <table className="table table-hover table-striped mb-0">
                        <thead className="table-light">
                        <tr>
                            <th scope="col">Ім'я користувача</th>
                            <th scope="col">Телефон</th>
                            <th scope="col">Ролі</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user, idx) => (
                            <tr key={idx}>
                                <td>{user.username}</td>
                                <td>{user.phone}</td>
                                <td>{user.roles.join(', ')}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllUsersPage;
