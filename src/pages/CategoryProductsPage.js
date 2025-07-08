import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CategoryProductsPage = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const token = localStorage.getItem('jwt');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingProductId, setAddingProductId] = useState(null);

    useEffect(() => {
        if (!token) {
            setError(t('not_authorized'));
            setLoading(false);
            return;
        }
        fetchProductsByCategory();
    }, [id, i18n.language]);

    const fetchProductsByCategory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/products/by-category/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
            setError('');
        } catch (e) {
            setError(t('fetch_error'));
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

    const changeLanguage = (lng) => i18n.changeLanguage(lng);

    if (loading) return <p>{t('loading')}</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-5">
            {/* Language Switch */}
            <div className="d-flex justify-content-end mb-3">
                <button onClick={() => changeLanguage('ua')} className="btn btn-outline-primary btn-sm me-2">UA</button>
                <button onClick={() => changeLanguage('en')} className="btn btn-outline-secondary btn-sm">EN</button>
            </div>

            <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
                ← {t('back')}
            </button>

            <h3>{t('products_in_category')}</h3>

            {products.length === 0 ? (
                <p>{t('no_products')}</p>
            ) : (
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>{t('image')}</th>
                        <th>{t('name')}</th>
                        <th>{t('description')}</th>
                        <th>{t('price')}</th>
                        <th>{t('stock')}</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td style={{ width: 100 }}>
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[0].url}
                                        alt={product.images[0].altText || product.name}
                                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 5 }}
                                    />
                                ) : (
                                    <span>{t('no_image')}</span>
                                )}
                            </td>
                            <td>{product.name}</td>
                            <td>{product.description}</td>
                            <td>{new Intl.NumberFormat('uk-UA', {
                                style: 'currency', currency: 'UAH'
                            }).format(product.price)}</td>
                            <td>{product.stock}</td>
                            <td>
                                <button
                                    className="btn btn-primary"
                                    disabled={addingProductId === product.id}
                                    onClick={() => addToCart(product)}
                                >
                                    {addingProductId === product.id ? t('adding') : t('add_to_cart')}
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
