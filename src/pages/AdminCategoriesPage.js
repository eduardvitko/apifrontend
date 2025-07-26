import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. ИМПОРТИРУЕМ наши новые функции вместо axios
import {
    fetchAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../api'; // Убедитесь, что путь к api.js верный

const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);

    const navigate = useNavigate();

    // Эта функция остается без изменений
    useEffect(() => {
        fetchCategories();
    }, []);

    // 2. ИСПОЛЬЗУЕМ наши новые функции в логике компонента
    const fetchCategories = async () => {
        try {
            const res = await fetchAdminCategories();
            setCategories(res.data);
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
            // Можно добавить обработку ошибок, например, если токен просрочен
            if (error.response && error.response.status === 401) {
                alert('Ваша сессия истекла. Пожалуйста, войдите снова.');
                navigate('/admin/login');
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Удалить категорию?')) return;
        try {
            await deleteCategory(id);
            fetchCategories(); // Обновляем список после удаления
        } catch (error) {
            console.error('Ошибка удаления категории:', error);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            alert('Название категории не может быть пустым.');
            return;
        }

        try {
            if (editingCategory) {
                // Обновление существующей категории
                await updateCategory(editingCategory.id, { name: newCategoryName });
            } else {
                // Создание новой категории
                await createCategory({ name: newCategoryName });
            }
            // Сбрасываем форму и обновляем список
            setNewCategoryName('');
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
        }
    };

    // JSX-разметка остается почти без изменений
    return (
        <div className="container mt-4">
            <h1>Категории товаров</h1>
            <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => navigate('/admin')}
            >
                ← Назад в админ-панель
            </button>
            <form onSubmit={handleSubmit} className="card p-3 mb-4 shadow-sm">
                <div className="input-group">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Название категории"
                        className="form-control"
                        required
                    />
                    <button
                        type="submit"
                        className={`btn ${editingCategory ? 'btn-primary' : 'btn-success'}`}
                    >
                        {editingCategory ? 'Обновить' : 'Создать'}
                    </button>
                    {editingCategory && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingCategory(null);
                                setNewCategoryName('');
                            }}
                            className="btn btn-secondary"
                        >
                            Отмена
                        </button>
                    )}
                </div>
            </form>

            <table className="table table-bordered table-hover">
                <thead className="table-dark">
                <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Название</th>
                    <th style={{ width: '200px', textAlign: 'center' }}>Действия</th>
                </tr>
                </thead>
                <tbody>
                {categories.map((cat) => (
                    <tr key={cat.id}>
                        <td>{cat.id}</td>
                        <td>{cat.name}</td>
                        <td style={{ textAlign: 'center' }}>
                            <button
                                onClick={() => handleEdit(cat)}
                                className="btn btn-primary btn-sm me-2"
                            >
                                Изменить
                            </button>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="btn btn-danger btn-sm"
                            >
                                Удалить
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminCategoriesPage;