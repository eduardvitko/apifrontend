import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const SearchResultsPage = () => {
    const query = useQuery();
    const searchTerm = query.get('q');
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!searchTerm) return;

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:8080/api/products/search?q=${encodeURIComponent(searchTerm)}`);
                const filtered = res.data.filter(
                    p => p.images?.length > 0 && p.price > 0 && p.stock > 0
                );
                setProducts(filtered);
                const qtyObj = {};
                filtered.forEach(p => qtyObj[p.id] = 1);
                setQuantities(qtyObj);
            } catch (e) {
                setError('Помилка завантаження товарів');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchTerm]);

    const handleQuantityChange = (productId, value) => {
        if (value >= 1) {
            setQuantities(prev => ({ ...prev, [productId]: value }));
        }
    };

    const addToCart = (product) => {
        const qty = quantities[product.id] || 1;
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const idx = cart.findIndex(i => i.productId === product.id);
        if (idx >= 0) {
            cart[idx].quantity += qty;
        } else {
            cart.push({ productId: product.id, name: product.name, price: product.price, quantity: qty });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`Додано ${qty} шт. ${product.name} в корзину`);
        navigate('/cart');
    };

    if (!searchTerm) return <p>Введіть пошуковий запит</p>;
    if (loading) return <p>Завантаження...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-4">
            <h3>Результати пошуку для: "{searchTerm}"</h3>
            {products.length === 0 ? (
                <p>Товарів не знайдено.</p>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {products.map(product => (
                        <div className="col" key={product.id}>
                            <div className="card h-100">
                                <img
                                    src={product.images[0].url}
                                    alt={product.images[0].altText || product.name}
                                    className="card-img-top"
                                    style={{ height: 200, objectFit: 'cover' }}
                                />
                                <div className="card-body d-flex flex-column">
                                    <h5>{product.name}</h5>
                                    <p>{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(product.price)}</p>
                                    <p>На складі: {product.stock}</p>
                                    <input
                                        type="number"
                                        min="1"
                                        max={product.stock}
                                        value={quantities[product.id] || 1}
                                        onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                                        className="form-control mb-2"
                                    />
                                    <button
                                        className="btn btn-primary mt-auto"
                                        onClick={() => addToCart(product)}
                                    >
                                        Додати в корзину
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;
