import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ← Важно: импорт навигации

const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/admin/all/categories');
            setCategories(res.data);
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Удалить категорию?')) return;
        try {
            await axios.delete(`http://localhost:8080/api/admin/delete/category/${id}`);
            fetchCategories();
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
        try {
            if (editingCategory) {
                await axios.put(
                    `http://localhost:8080/api/admin/update/category/${editingCategory.id}`,
                    { name: newCategoryName }
                );
            } else {
                await axios.post('http://localhost:8080/api/admin/create/category', {
                    name: newCategoryName
                });
            }
            setNewCategoryName('');
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Категории товаров</h1>
            <button
                className="btn btn-outline-secondary"
                onClick={() => navigate('/admin')}
            >
                Назад
            </button>
            <form onSubmit={handleSubmit} className="d-flex mb-3">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Название категории"
                    className="form-control me-2"
                    required
                />
                <button
                    type="submit"
                    className={`btn ${editingCategory ? 'btn-primary' : 'btn-success'} me-2`}
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
            </form>

            <table className="table table-bordered">
                <thead>
                <tr>
                    <th style={{ width: '60px' }}>ID</th>
                    <th>Название</th>
                    <th style={{ width: '200px' }}>Действия</th>
                </tr>
                </thead>
                <tbody>
                {categories.map((cat) => (
                    <tr key={cat.id}>
                        <td>{cat.id}</td>
                        <td>{cat.name}</td>
                        <td>
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
