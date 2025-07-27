import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap'; // Використовуємо компоненти Bootstrap для єдиного стилю

// 1. ІМПОРТУЄМО наші централізовані функції
import { fetchAllProducts, createOrder } from '../api';

const CreateOrderPage = () => {
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Додатковий стан для блокування кнопки
    const navigate = useNavigate();

    // Завантажуємо список товарів при завантаженні сторінки
    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            // 2. ВИКОРИСТОВУЄМО централізовану функцію для завантаження товарів
            const response = await fetchAllProducts();
            setProducts(response.data);
        } catch (err) {
            console.error('Не вдалося завантажити товари', err);
            setMessage({ type: 'danger', text: 'Помилка: Не вдалося завантажити товари.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Логіка вибору кількості - без змін, вона правильна
    const handleQuantityChange = (productId, productName, price, quantity) => {
        const qty = parseInt(quantity);

        setSelectedItems(prev => {
            // Видаляємо товар, якщо кількість 0 або не є числом
            if (isNaN(qty) || qty <= 0) {
                return prev.filter(item => item.productId !== productId);
            }

            const existing = prev.find(item => item.productId === productId);
            if (existing) {
                return prev.map(item =>
                    item.productId === productId ? { ...item, quantity: qty } : item
                );
            } else {
                return [...prev, { productId, productName, price, quantity: qty }];
            }
        });
    };

    // 3. ОНОВЛЮЄМО функцію створення замовлення
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSubmitting(true);

        if (selectedItems.length === 0) {
            setMessage({ type: 'warning', text: 'Будь ласка, виберіть хоча б один товар.' });
            setIsSubmitting(false);
            return;
        }

        // Перевіряємо, чи користувач авторизований, за правильним ключем 'token'
        if (!localStorage.getItem('token')) {
            setMessage({ type: 'danger', text: 'Будь ласка, увійдіть, щоб оформити замовлення.' });
            setIsSubmitting(false);
            navigate('/login');
            return;
        }

        try {
            // 4. НАДСИЛАЄМО ПРАВИЛЬНУ СТРУКТУРУ ДАНИХ
            // Ваш бекенд очікує List<OrderItemDto>, тобто просто масив
            const orderItemsDto = selectedItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                productName: item.productName
            }));

            // Використовуємо централізовану функцію `createOrder`
            await createOrder(orderItemsDto);

            setMessage({ type: 'success', text: 'Замовлення створено успішно! Перенаправляємо на сторінку замовлень...' });
            setSelectedItems([]); // Очищуємо вибір

            // Перенаправляємо користувача на сторінку його замовлень
            setTimeout(() => navigate('/orders'), 2000);

        } catch (e) {
            console.error('Помилка при створенні замовлення', e);
            setMessage({ type: 'danger', text: e.response?.data?.message || 'Помилка при створенні замовлення.' });
            setIsSubmitting(false);
        }
    };

    if (loading) return <p className="text-center mt-5">Завантаження товарів...</p>;

    return (
        <div className="container mt-5">
            <h3 className="mb-4">Створити нове замовлення</h3>

            {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <form onSubmit={handleSubmit}>
                <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                    <tr>
                        <th>Назва товару</th>
                        <th>Ціна</th>
                        <th style={{width: '150px'}}>Кількість</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.price.toFixed(2)} ₴</td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    min="0"
                                    placeholder="0"
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
                <div className="d-flex justify-content-between align-items-center mt-4">
                    <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                        ← Назад
                    </Button>
                    <Button
                        type="submit"
                        variant="success"
                        disabled={selectedItems.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? 'Обробка...' : 'Оформити замовлення'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateOrderPage;