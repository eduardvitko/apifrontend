import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. ІМПОРТУЄМО наші готові функції з api.js
import { createProduct, fetchAdminCategories } from '../api'; // Переконайтесь, що шлях правильний

const CreateProductPage = () => {
    // Стани для полів форми
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState(0);
    const [categoryId, setCategoryId] = useState('');

    // Стан для списку категорій
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // Завантажуємо категорії при першому завантаженні компонента
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetchAdminCategories();
                setCategories(response.data);
            } catch (err) {
                console.error("Помилка завантаження категорій:", err);
                setError('Не вдалося завантажити категорії. Можливо, ваша сесія закінчилась.');
                if (err.response && err.response.status === 401) {
                    navigate('/admin/login');
                }
            }
        };
        loadCategories();
    }, [navigate]); // Додаємо navigate до залежностей

    // Обробник відправки форми
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Базова валідація
        if (!name || !description || !price || !stock || !categoryId) {
            setError('Будь ласка, заповніть усі поля.');
            return;
        }

        const productData = {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            categoryId: parseInt(categoryId)
        };

        try {
            // 2. ВИКОРИСТОВУЄМО нашу централізовану функцію
            await createProduct(productData);

            // У разі успіху перенаправляємо на сторінку всіх товарів
            navigate('/admin/products');
        } catch (err) {
            console.error('Помилка при створенні товару:', err);
            setError('Помилка при створенні товару. Перевірте консоль для деталей.');
        }
    };

    // JSX-розмітка залишається майже такою ж
    return (
        <div className="container mt-5">
            <div className="card shadow-lg">
                <div className="card-header">
                    <h3>Створити новий товар</h3>
                </div>
                <div className="card-body">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Назва</label>
                            <input type="text" className="form-control" value={name}
                                   onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Опис</label>
                            <textarea className="form-control" value={description}
                                      onChange={(e) => setDescription(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Ціна</label>
                            <input type="number" step="0.01" className="form-control" value={price}
                                   onChange={(e) => setPrice(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Кількість на складі</label>
                            <input type="number" className="form-control" value={stock}
                                   onChange={(e) => setStock(e.target.value)} required min="0" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Категорія</label>
                            <select className="form-select" value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)} required>
                                <option value="">Оберіть категорію...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name} (ID: {cat.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-success">Створити</button>
                        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/admin/products')}>
                            Назад
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProductPage;