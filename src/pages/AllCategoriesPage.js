import React, { useEffect, useState, useCallback } from 'react'; // Додаємо useCallback
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 1. Імпортуємо нашу централізовану функцію з api.js
import { fetchCategories } from '../api';

import CategoryNames from './CategoryNames';

const AllCategoriesPage = () => {
    const { t, i18n } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 2. Створюємо функцію для завантаження даних.
    //    useCallback потрібен, щоб функція не створювалася заново при кожному рендері,
    //    це оптимізація і вимога для хука useEffect.
    const loadCategories = useCallback(async () => {
        setLoading(true);
        try {
            // 3. Використовуємо нашу чисту функцію.
            //    Токен авторизації додасться автоматично!
            const response = await fetchCategories();
            setCategories(response.data);
        } catch (e) {
            setError(t('categories_load_error'));
            // Якщо сервер повернув помилку авторизації, перенаправляємо на логін
            if (e.response?.status === 401 || e.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [t, navigate]); // Залежності для useCallback

    // 4. Викликаємо функцію завантаження даних при першому рендері компонента
    useEffect(() => {
        loadCategories();
    }, [loadCategories]); // Залежність для useEffect

    if (loading) return <p>{t('loading')}</p>;
    if (error) return <p className="text-danger">{error}</p>;

    const lang = i18n.language;

    return (
        <div className="container mt-5">
            <button className="btn btn-secondary mb-4" onClick={() => navigate(-1)}>
                ← {t('back')}
            </button>
            <h3 className="mb-4">{t('select_category')}</h3>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {categories.map((category) => (
                    <div className="col" key={category.id}>
                        <div className="card h-100 shadow-sm border-primary">
                            <div className="card-body d-flex flex-column justify-content-between">
                                <h5 className="card-title text-center">
                                    {CategoryNames[category.id]?.[lang] || category.name}
                                </h5>

                                <button
                                    className="btn btn-outline-primary mt-3"
                                    onClick={() => navigate(`/categories/${category.id}/products`)}
                                >
                                    {t('view_products')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllCategoriesPage;