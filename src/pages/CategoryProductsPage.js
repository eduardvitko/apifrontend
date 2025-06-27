import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CategoryProductsPage = () => {
    const { id } = useParams(); // змінив categoryId на id
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem('jwt');

    useEffect(() => {
        fetchProductsByCategory();
    }, [id]);

    const fetchProductsByCategory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/products/by-category/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (e) {
            setError('Не вдалося завантажити товари');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Завантаження...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-5">
            <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>Назад</button>
            <h3>Товари в категорії</h3>
            {products.length === 0 ? (
                <p>Немає товарів у цій категорії.</p>
            ) : (
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>Назва</th>
                        <th>Опис</th>
                        <th>Ціна</th>
                        <th>Залишок</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.description}</td>
                            <td>{product.price}</td>
                            <td>{product.stock}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CategoryProductsPage;
