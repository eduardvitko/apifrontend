import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 1. ІМПОРТУЄМО нашу централізовану функцію.
//    Ми перейменовуємо її при імпорті, щоб уникнути конфлікту імен.
import { fetchProductsByCategory as fetchProductsByCategoryAPI } from '../api';

const CategoryProductsPage = () => {
    const { id } = useParams(); // Отримуємо ID категорії з URL
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingProductId, setAddingProductId] = useState(null);

    // 2. ВИДАЛЯЄМО ручне отримання токена.
    //    Для публічних запитів він не потрібен. Для захищених - його додасть перехоплювач.
    // const token = localStorage.getItem('jwt'); // <-- ЦЕЙ РЯДОК БІЛЬШЕ НЕ ПОТРІБЕН

    // 3. ВИКОРИСТОВУЄМО useCallback для оптимізації та правильної роботи useEffect
    const fetchProducts = useCallback(async () => {
        if (!id) return; // Не робити запит, якщо ID ще немає

        setLoading(true);
        setError('');
        try {
            // 4. ВИКОРИСТОВУЄМО нашу нову, централізовану функцію з api.js
            const response = await fetchProductsByCategoryAPI(id);
            setProducts(response.data);
        } catch (e) {
            console.error("Помилка завантаження товарів:", e);
            setError(t('fetch_error'));
        } finally {
            setLoading(false);
        }
    }, [id, t]); // Залежності: id і функція перекладу t

    // 5. useEffect тепер залежить від мемоізованої функції fetchProducts
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, i18n.language]); // Додаємо i18n.language для перезавантаження при зміні мови

    // Логіка додавання в кошик - без змін, вона правильна
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

        // Можна додати невелику затримку для кращого UX
        setTimeout(() => {
            setAddingProductId(null);
            navigate('/cart');
        }, 300);
    };

    // Функція зміни мови - без змін
    const changeLanguage = (lng) => i18n.changeLanguage(lng);

    // --- JSX-розмітка без змін ---
    // Вона написана добре і не потребує правок

    if (loading) return <p className="text-center mt-5">{t('loading')}</p>;
    if (error) return <p className="text-danger text-center mt-5">{error}</p>;

    return (
        <div className="container mt-5">
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
                <table className="table table-bordered table-hover">
                    <thead className="table-dark">
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
                            <td style={{ width: 100, textAlign: 'center' }}>
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[0].url}
                                        alt={product.images[0].altText || product.name}
                                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 5 }}
                                    />
                                ) : (
                                    <span className="text-muted">{t('no_image')}</span>
                                )}
                            </td>
                            <td style={{ verticalAlign: 'middle' }}>{product.name}</td>
                            <td style={{ verticalAlign: 'middle' }}>{product.description}</td>
                            <td style={{ verticalAlign: 'middle' }}>{new Intl.NumberFormat('uk-UA', {
                                style: 'currency', currency: 'UAH'
                            }).format(product.price)}</td>
                            <td style={{ verticalAlign: 'middle' }}>{product.stock}</td>
                            <td style={{ verticalAlign: 'middle' }}>
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