import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AllProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem('jwt');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/admin/all/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch {
            setError('Помилка завантаження товарів');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!id) return;
        try {
            await axios.delete(`http://localhost:8080/api/admin/delete/product/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(prev => prev.filter(product => product.id !== id));
        } catch {
            alert('Не вдалося видалити товар');
        }
    };

    const handleUpdate = (product) => {
        // твоя логика обновления
    };

    if (loading) return <p>Завантаження...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-5">
            <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => navigate('/admin')}
            >
                Назад
            </button>

            {/* Кнопка Создать товар */}
            <button
                className="btn btn-success mb-3 ms-3"
                onClick={() => navigate('/admin/products/create')}
            >
                Створити товар
            </button>

            <h3>Список товарів</h3>
            <table className="table table-bordered">
                <thead>
                <tr>
                    <th>Назва</th>
                    <th>Опис</th>
                    <th>Ціна</th>
                    <th>Залишок</th>
                    <th>Категорія</th>
                    <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {products.map(product => (
                    <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.description}</td>
                        <td>{product.price}</td>
                        <td>{product.stock}</td>
                        <td>{product.categoryName || '-'}</td>
                        <td>
                            <button
                                className="btn btn-sm btn-warning me-2"
                                onClick={() => navigate(`/admin/products/update/${product.id}`)}
                            >
                                Редагувати
                            </button>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(product.id)}
                            >
                                Видалити
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AllProductsPage;
