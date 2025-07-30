import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 1. ІМПОРТУЄМО ПОТРІБНІ КОМПОНЕНТИ З REACT-BOOTSTRAP
import { Navbar as BootstrapNavbar, Nav, Container, Form, Button } from 'react-bootstrap';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [search, setSearch] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Стан для відстеження авторизації
    const navigate = useNavigate();

    // Перевіряємо наявність токена при завантаженні та зміні localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token); // !!token перетворює рядок/null на true/false

        // Додатково: слухаємо зміни в localStorage (корисно для майбутнього)
        const handleStorageChange = () => {
            setIsLoggedIn(!!localStorage.getItem('token'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/products/search?q=${encodeURIComponent(search)}`);
            setSearch('');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/login');
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        // 2. ВИКОРИСТОВУЄМО АДАПТИВНИЙ КОМПОНЕНТ NAVBAR
        // `expand="lg"` означає, що меню буде розгорнуте на великих екранах,
        // а на менших - згорнуте в "бургер".
        <BootstrapNavbar bg="dark" variant="dark" expand="lg" sticky="top">
            <Container>
                //<BootstrapNavbar.Brand as={Link} to="/">{t('welcome')}</BootstrapNavbar.Brand>

                {/* 3. КНОПКА "БУРГЕР", яка з'являється на мобільних */}
                <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

                {/* 4. КОНТЕЙНЕР, ЯКИЙ ЗГОРТАЄТЬСЯ */}
                <BootstrapNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {/* Показуємо різні посилання в залежності від того, чи увійшов користувач */}
                        {isLoggedIn ? (
                            <>
                                <Nav.Link as={Link} to="/profile">{t('profile')}</Nav.Link>
                                <Nav.Link as={Link} to="/orders">{t('orders')}</Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/register">{t('register')}</Nav.Link>
                                <Nav.Link as={Link} to="/login">{t('login')}</Nav.Link>
                            </>
                        )}
                        <Nav.Link as={Link} to="/categories/all">{t('categories')}</Nav.Link>
                    </Nav>

                    {/* Пошук, кошик, мова та кнопка виходу */}
                    <Nav className="align-items-center">
                        <Form className="d-flex me-lg-3 mb-2 mb-lg-0" onSubmit={handleSearchSubmit}>
                            <Form.Control
                                type="text"
                                placeholder={t('search')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                size="sm"
                            />
                            <Button variant="outline-light" type="submit" size="sm" className="ms-2">🔍</Button>
                        </Form>

                        <Nav.Link as={Link} to="/cart" className="me-lg-3 mb-2 mb-lg-0">
                            🛒 {t('cart')}
                        </Nav.Link>

                        <div className="d-flex me-lg-3 mb-2 mb-lg-0">
                            <Button
                                variant={i18n.language === 'ua' ? 'light' : 'outline-light'}
                                size="sm" className="me-1" onClick={() => changeLanguage('ua')}
                            >UA</Button>
                            <Button
                                variant={i18n.language === 'en' ? 'light' : 'outline-light'}
                                size="sm" onClick={() => changeLanguage('en')}
                            >EN</Button>
                        </div>

                        {isLoggedIn && (
                            <Button variant="outline-warning" size="sm" onClick={handleLogout}>
                                {t('logout')}
                            </Button>
                        )}
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
};

export default Navbar;