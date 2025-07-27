import React, { useEffect, useState } from 'react';
// 1. ДОДАЄМО useLocation, ЩОБ ОТРИМАТИ ПЕРЕДАНІ ДАНІ
import { useNavigate, useLocation } from 'react-router-dom';
import { createProduct, fetchAdminCategories } from '../api';

const CreateProductPage = () => {
    // ... (всі ваші існуючі стани: name, description, price, etc.)
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);

    const navigate = useNavigate();
    const location = useLocation(); // <-- Отримуємо доступ до даних маршруту

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetchAdminCategories();
                setCategories(response.data);

                // 2. ПЕРЕВІРЯЄМО, ЧИ БУЛО ПЕРЕДАНО ID КАТЕГОРІЇ
                const passedCategoryId = location.state?.categoryId;
                if (passedCategoryId) {
                    // Якщо так, встановлюємо його як вибраний за замовчуванням
                    setCategoryId(passedCategoryId);
                }

            } catch (err) {
                console.error("Помилка завантаження категорій:", err);
            }
        };
        loadCategories();
    }, [location.state]); // Додаємо location.state до залежностей

    const handleSubmit = async (e) => {
        // ... (ваш код для відправки форми, він залишається без змін)
    };

    return (
        <div className="container mt-5">
            {/* ... (ваша форма без змін) ... */}
            <div className="mb-3">
                <label className="form-label">Категорія</label>
                <select
                    className="form-select"
                    value={categoryId} // <-- `value` тепер буде автоматично встановлено
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                >
                    <option value="">Оберіть категорію</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>
            {/* ... (решта вашої форми) ... */}
        </div>
    );
};

export default CreateProductPage;