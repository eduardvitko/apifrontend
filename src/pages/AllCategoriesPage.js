import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AllCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('jwt');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/categories/all', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCategories(response.data);
        } catch (e) {
            setError('Не вдалося завантажити категорії');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Завантаження...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-5">
            <button className="btn btn-secondary mb-4" onClick={() => navigate(-1)}>
                ← Назад
            </button>
            <h3 className="mb-4">Обирай категорію</h3>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {categories.map(category => (
                    <div className="col" key={category.id}>
                        <div className="card h-100 shadow-sm border-primary">
                            <div className="card-body d-flex flex-column justify-content-between">
                                <h5 className="card-title text-center">{category.name}</h5>
                                <button
                                    className="btn btn-outline-primary mt-3"
                                    onClick={() => navigate(`/categories/${category.id}/products`)}
                                >
                                    Переглянути товари
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
