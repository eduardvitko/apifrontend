import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/products/search?q=${encodeURIComponent(search)}`);
            setSearch('');
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <nav className="navbar navbar-expand navbar-dark bg-dark px-3">
            <Link className="navbar-brand" to="/">{t('welcome')}</Link>

            <div className="navbar-nav">
                <Link className="nav-link" to="/register">{t('register')}</Link>
                <Link className="nav-link" to="/login">{t('login').toLocaleLowerCase()}</Link>
                <Link className="nav-link" to="/profile">{t('profile')}</Link>
                <Link className="nav-link" to="/allCategories">{t('categories')}</Link>
            </div>

            <form className="d-flex ms-auto" onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    className="form-control me-2"
                    placeholder={t('search')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-outline-light" type="submit">🔍</button>
            </form>

            <div className="d-flex ms-3">
                <button
                    className={`btn btn-sm btn-outline-light me-1 ${i18n.language === 'ua' ? 'active' : ''}`}
                    onClick={() => changeLanguage('ua')}
                    type="button"
                >
                    UA
                </button>
                <button
                    className={`btn btn-sm btn-outline-light ${i18n.language === 'en' ? 'active' : ''}`}
                    onClick={() => changeLanguage('en')}
                    type="button"
                >
                    EN
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
