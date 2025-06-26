import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateProductPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState(0);
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem('jwt');

    useEffect(() => {
        // Завантажити категорії
        axios.get('http://localhost:8080/api/admin/all/categories', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => setCategories(response.data))
            .catch(() => setError('Не вдалося завантажити категорії'));
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/admin/create/product', {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                categoryId: parseInt(categoryId)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/admin/products');
        } catch (err) {
            setError('Помилка при створенні товару');
        }
    };

    return (
        <div className="container mt-5">
            <h3>Створити новий товар</h3>
            {error && <p className="text-danger">{error}</p>}
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
                    <label className="form-label">Залишок</label>
                    <input type="number" className="form-control" value={stock}
                           onChange={(e) => setStock(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Категорія</label>
                    <select className="form-select" value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)} required>
                        <option value="">Оберіть категорію</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
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
    );
};

export default CreateProductPage;
