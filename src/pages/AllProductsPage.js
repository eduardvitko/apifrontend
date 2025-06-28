import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const token = localStorage.getItem('jwt');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/products/all', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts(response.data);
        } catch (e) {
            setError('Не вдалося завантажити товари');
        }
    };

    const addToCart = (product) => {
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = currentCart.find(p => p.productId === product.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            currentCart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(currentCart));
        alert('Товар додано до корзини');
    };

    return (
        <div className="container mt-5">
            <h3>Усі товари</h3>
            {error && <p className="text-danger">{error}</p>}
            <table className="table table-bordered">
                <thead>
                <tr>
                    <th>Назва</th>
                    <th>Опис</th>
                    <th>Ціна</th>
                    <th>Залишок</th>
                    <th>Дія</th>
                </tr>
                </thead>
                <tbody>
                {products.map(product => (
                    <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.description}</td>
                        <td>{product.price}</td>
                        <td>{product.stock}</td>
                        <td>
                            <button className="btn btn-primary btn-sm"
                                    onClick={() => addToCart(product)}>
                                Додати до корзини
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
