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
            const response = await axios.get('http://localhost:8080/api/products/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (e) {
            setError('Помилка при завантаженні товарів');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Ви дійсно хочете видалити цей товар?')) return;
        try {
            await axios.delete(`http://localhost:8080/api/admin/delete/product/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProducts();
        } catch (e) {
            alert('Помилка при видаленні товару');
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/products/update/${id}`);
    };

    const handleCreate = () => {
        navigate('/admin/products/create');
    };

    return (
        <div className="container mt-5">
            <h2>Керування товарами</h2>
            <button className="btn btn-success mb-3" onClick={handleCreate}>Створити товар</button>

            {loading ? (
                <p>Завантаження...</p>
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : (
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Назва</th>
                        <th>Ціна</th>
                        <th>Залишок</th>
                        <th>Категорія</th>
                        <th>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map(prod => (
                        <tr key={prod.id}>
                            <td>{prod.name}</td>
                            <td>{prod.price} грн</td>
                            <td>{prod.stock}</td>
                            <td>{prod.categoryName}</td>
                            <td>
                                <button className="btn btn-primary me-2" onClick={() => handleEdit(prod.id)}>Редагувати</button>
                                <button className="btn btn-danger" onClick={() => handleDelete(prod.id)}>Видалити</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AllProductsPage;
