import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const navigate = useNavigate();
    console.log("AdminPage rendered");

    const goToAllUsers = () => {
        navigate('/admin/users');
    };

    return (
        <div className="container mt-5">
            <div className="card shadow">
                <div className="card-header bg-dark text-white">
                    <h4>Адмін-панель</h4>
                </div>
                <div className="card-body">
                    <p>Вітаємо, Адміністраторе!</p>
                    <button onClick={goToAllUsers} className="btn btn-primary">
                        Переглянути всіх користувачів
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
