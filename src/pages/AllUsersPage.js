import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('jwt');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Users from API:', response.data); // <- проверь структуру
            setUsers(response.data);
        } catch {
            setError('Помилка завантаження користувачів');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        console.log('Delete clicked, id:', id);
        if (!id) {
            console.error("id пользователя для удаления не задан");
            return;

        }
        try {
            await axios.delete(`http://localhost:8080/api/admin/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(prev => prev.filter(user => user.id !== id));
        } catch (e) {
            console.error(e);
            alert('Не вдалося видалити користувача');
        }
    };

    const handleUpdate = (user) => {
        const newUsername = prompt("Нове ім'я користувача:", user.username);
        const newPhone = prompt("Новий телефон:", user.phone);

        if (!newUsername || !newPhone) return;

        axios.put(`http://localhost:8080/api/admin/update/${user.id}`, {
            ...user,
            username: newUsername,
            phone: newPhone
        }, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => {
            fetchUsers(); // оновити таблицю
        }).catch(() => {
            alert('Не вдалося оновити користувача');
        });
    };

    if (loading) return <p>Завантаження...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-5">
            <h3>Список користувачів</h3>
            <table className="table table-bordered">
                <thead>
                <tr>
                    <th>Ім’я</th>
                    <th>Телефон</th>
                    <th>Ролі</th>
                    <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.phone}</td>
                        <td>{Array.isArray(user.roles) ? user.roles.join(', ') : user.roles}</td>
                        <td>
                            <td>
                                <button className="btn btn-sm btn-warning me-2" onClick={() => handleUpdate(user)}>Редагувати</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.id)}>Видалити</button>
                            </td>


                        </td>
                    </tr>
                ))}

                </tbody>
            </table>
        </div>
    );
};

export default AllUsersPage;
