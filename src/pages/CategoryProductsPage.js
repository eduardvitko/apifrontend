import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CategoryProductsPage = () => {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingProductId, setAddingProductId] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('jwt');

    useEffect(() => {
        if (!token) {
            setError('Ви не авторизовані');
            setLoading(false);
            return;
        }
        fetchProductsByCategory();
    }, [id]);

    const fetchProductsByCategory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/products/by-category/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
            setError('');
        } catch (e) {
            setError(e.response?.data?.message || 'Не вдалося завантажити товари');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        setAddingProductId(product.id);

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingIndex = cart.findIndex(item => item.productId === product.id);

        if (existingIndex !== -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        setAddingProductId(null);

        navigate('/cart');
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
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.description}</td>
                            <td>{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(product.price)}</td>
                            <td>{product.stock}</td>
                            <td>
                                <button
                                    className="btn btn-primary"
                                    disabled={addingProductId === product.id}
                                    onClick={() => addToCart(product)}
                                >
                                    {addingProductId === product.id ? 'Додаємо...' : 'Додати в корзину'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CategoryProductsPage;
