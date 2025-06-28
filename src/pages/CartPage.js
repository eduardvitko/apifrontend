import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const token = localStorage.getItem('jwt');
    const userId = localStorage.getItem('userId'); // сохранённый после логина
    const [message, setMessage] = useState('');

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(storedCart);
    }, []);

    const removeFromCart = (productId) => {
        const updatedCart = cart.filter(item => item.productId !== productId);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const handleOrder = async () => {
        try {
            await axios.post("http://localhost:8080/api/orders/create", {
                userId: parseInt(userId),
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage('Замовлення успішно створено!');
            localStorage.removeItem('cart');
            setCart([]);
        } catch (e) {
            setMessage('Помилка при створенні замовлення');
        }
    };

    return (
        <div className="container mt-5">
            <h3>🛒 Корзина</h3>
            {message && <p className="text-success">{message}</p>}
            {cart.length === 0 ? (
                <p>Ваша корзина пуста.</p>
            ) : (
                <div>
                    <table className="table table-bordered">
                        <thead>
                        <tr>
                            <th>Назва</th>
                            <th>Кількість</th>
                            <th>Ціна</th>
                            <th>Дія</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cart.map(item => (
                            <tr key={item.productId}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>{item.price}</td>
                                <td>
                                    <button className="btn btn-danger btn-sm"
                                            onClick={() => removeFromCart(item.productId)}>
                                        Видалити
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <button className="btn btn-success" onClick={handleOrder}>
                        Оформити замовлення
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartPage;
