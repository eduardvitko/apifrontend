import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p>Завантаження...</p>;
    if (!product) return <p>Товар не знайдено</p>;

    return (
        <div>
            <h1>{product.name}</h1>
            <p>Опис: {product.description}</p>
            <p>Ціна: {product.price} грн</p>
            {/* додай інші дані товару */}
        </div>
    );
};

export default ProductDetailsPage;
