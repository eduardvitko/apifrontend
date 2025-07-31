import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Table, Alert, Spinner, Card } from 'react-bootstrap';

// 1. ІМПОРТУЄМО НАШІ ЦЕНТРАЛІЗОВАНІ АДМІНСЬКІ ФУНКЦІЇ
import { fetchAllUsers, updateUser, deleteUser } from '../api';

const AllUsersPage = () => {
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const navigate = useNavigate();

    // 2. ОНОВЛЕНА ФУНКЦІЯ ЗАВАНТАЖЕННЯ ДАНИХ
    const fetchUsers = React.useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetchAllUsers();
            setUsers(response.data);
        } catch (err) {
            console.error('Помилка завантаження користувачів:', err);
            setError(err.response?.data?.message || 'Не вдалося завантажити користувачів. Можливо, у вас недостатньо прав.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (!localStorage.getItem('token')) {
            setError('Будь ласка, увійдіть як адміністратор.');
            setLoading(false);
            navigate('/admin/login');
            return;
        }
        fetchUsers();
    }, [fetchUsers, navigate]);

    // 3. ОНОВЛЕНІ ОБРОБНИКИ ПОДІЙ
    const handleDelete = async (id) => {
        if (!id) {
            console.error("ID користувача для видалення не задано");
            return;
        }
        if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
            try {
                await deleteUser(id);
                setUsers(prev => prev.filter(user => user.id !== id));
                alert('Користувача успішно видалено.');
            } catch (e) {
                console.error('Помилка видалення:', e);
                alert('Не вдалося видалити користувача.');
            }
        }
    };

    const handleUpdate = async (user) => {
        const newUsername = prompt("Введіть нове ім'я користувача:", user.username);
        // Можна додати більше полів для оновлення
        if (!newUsername) return;

        try {
            // Важливо: передаємо тільки ті дані, які хочемо змінити
            await updateUser(user.id, { username: newUsername });
            alert('Користувача успішно оновлено.');
            fetchUsers(); // Оновлюємо таблицю
        } catch (e) {
            console.error('Помилка оновлення:', e);
            alert('Не вдалося оновити користувача.');
        }
    };

    // --- JSX-розмітка з покращеннями ---

    if (loading) {
        return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="secondary" onClick={() => navigate('/admin')}>
                    ← Назад до адмін-панелі
                </Button>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Керування користувачами</h2>
                <Button variant="outline-secondary" onClick={() => navigate('/admin')}>
                    ← Назад
                </Button>
            </div>

            <Card>
                <Card.Body>
                    <Table responsive striped bordered hover className="align-middle">
                        <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Ім’я</th>
                            <th>Телефон</th>
                            <th>Ролі</th>
                            <th className="text-center">Дії</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.phone || '-'}</td>
                                <td>
                                    {Array.isArray(user.roles)
                                        ? user.roles.join(', ')
                                        : (typeof user.roles === 'string' ? user.roles : 'N/A')}
                                </td>
                                <td className="text-center">
                                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleUpdate(user)}>
                                        Редагувати
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>
                                        Видалити
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AllUsersPage;