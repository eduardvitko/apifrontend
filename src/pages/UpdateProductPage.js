import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateProductPage = () => {
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('jwt');

    useEffect(() => {
        fetchProduct();
        fetchCategories();
    }, []);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/admin/product/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProduct(response.data);
        } catch {
            setError('Не вдалося завантажити товар');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/all/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data);
        } catch {
            setError('Не вдалося завантажити категорії');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8080/api/admin/update/product/${id}`, {
                ...product,
                price: parseFloat(product.price),
                stock: parseInt(product.stock),
                categoryId: parseInt(product.categoryId)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/admin/products');
        } catch {
            setError('Помилка при оновленні товару');
        }
    };

    if (loading) return <p>Завантаження...</p>;
    if (!product) return <p className="text-danger">Товар не знайдено</p>;

    return (
        <div className="container mt-5">
            <h3>Редагувати товар</h3>
            {error && <p className="text-danger">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Назва</label>
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Опис</label>
                    <textarea
                        name="description"
                        className="form-control"
                        value={product.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Ціна</label>
                    <input
                        type="number"
                        name="price"
                        className="form-control"
                        value={product.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Залишок</label>
                    <input
                        type="number"
                        name="stock"
                        className="form-control"
                        value={product.stock}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Категорія</label>
                    <select
                        name="categoryId"
                        className="form-select"
                        value={product.categoryId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Оберіть категорію</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Зберегти</button>
                <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/admin/products')}>
                    Назад
                </button>
            </form>
        </div>
    );
};

export default UpdateProductPage;
