// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/products/search?q=${encodeURIComponent(search)}`);
            setSearch('');
        }
    };

    return (
        <nav className="navbar navbar-expand navbar-dark bg-dark px-3">
            <Link className="navbar-brand" to="/">My Store</Link>
            <div className="navbar-nav">
                <Link className="nav-link" to="/register">Register</Link>
                <Link className="nav-link" to="/login">Login</Link>
                <Link className="nav-link" to="/profile">Profile</Link>
                <Link className="nav-link" to="/allCategories">Categories</Link>
            </div>
            <form className="d-flex ms-auto" onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Пошук товару..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-outline-light" type="submit">Пошук</button>
            </form>
        </nav>
    );
};

export default Navbar;
