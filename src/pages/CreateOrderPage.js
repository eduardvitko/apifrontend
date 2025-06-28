import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CreateOrderPage = () => {
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('jwt');

    useEffect(() => {
        axios.get('http://localhost:8080/api/products/all', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => setProducts(response.data))
            .catch(() => setMessage('Не вдалося завантажити товари'));
    }, [token]);

    const handleQuantityChange = (productId, productName, price, quantity) => {
        const qty = parseInt(quantity);
        if (qty < 0) return;

        setSelectedItems(prev => {
            const existing = prev.find(item => item.productId === productId);
            if (existing) {
                return prev.map(item =>
                    item.productId === productId ? { ...item, quantity: qty } : item
                ).filter(item => item.quantity > 0);
            } else {
                return [...prev, { productId, productName, price, quantity: qty }];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedItems.length === 0) {
            setMessage('Виберіть хоча б один товар');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/orders/create', {
                items: selectedItems
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('Замовлення створено успішно!');
            setSelectedItems([]);
        } catch (e) {
            setMessage('Помилка при створенні замовлення');
        }
    };

    return (
        <div className="container mt-5">
            <h3>Створити замовлення</h3>
            {message && <p className="text-info">{message}</p>}
            <form onSubmit={handleSubmit}>
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>Назва</th>
                        <th>Ціна</th>
                        <th>Кількість</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.price}</td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    min="0"
                                    value={
                                        selectedItems.find(item => item.productId === product.id)?.quantity || ''
                                    }
                                    onChange={(e) =>
                                        handleQuantityChange(
                                            product.id,
                                            product.name,
                                            product.price,
                                            e.target.value
                                        )
                                    }
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <button type="submit" className="btn btn-success">Оформити замовлення</button>
            </form>
        </div>
    );
};

export default CreateOrderPage;
