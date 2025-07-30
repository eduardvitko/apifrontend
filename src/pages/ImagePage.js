import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Image } from 'react-bootstrap';

// 1. ІМПОРТУЄМО НАШІ ЦЕНТРАЛІЗОВАНІ ФУНКЦІЇ
import {
    fetchAllImages,
    createImage,
    updateImage,
    deleteImage,
    fetchAdminProducts
} from '../api';

const ImagePage = () => {
    const [images, setImages] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [formData, setFormData] = useState({ url: '', altText: '', productId: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 2. ЄДИНА ФУНКЦІЯ ДЛЯ ЗАВАНТАЖЕННЯ ВСІХ ДАНИХ
    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [imagesRes, productsRes] = await Promise.all([
                fetchAllImages(),
                fetchAdminProducts()
            ]);
            setImages(imagesRes.data);
            setProducts(productsRes.data);
        } catch (err) {
            setError('Не вдалося завантажити дані. Можливо, у вас недостатньо прав.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            setError('Будь ласка, увійдіть як адміністратор.');
            setLoading(false);
            navigate('/admin/login');
            return;
        }
        loadData();
    }, [loadData, navigate]);

    // 3. ОНОВЛЕНІ ОБРОБНИКИ ПОДІЙ
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const dataToSend = {
            ...formData,
            productId: parseInt(formData.productId, 10)
        };

        try {
            if (selectedImage) {
                await updateImage(selectedImage.id, { ...dataToSend, id: selectedImage.id });
                alert('Зображення успішно оновлено!');
            } else {
                await createImage(dataToSend);
                alert('Зображення успішно створено!');
            }
            setSelectedImage(null);
            setFormData({ url: '', altText: '', productId: '' });
            await loadData(); // Перезавантажуємо дані
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка при збереженні зображення.');
        }
    };

    const handleEditClick = (image) => {
        setSelectedImage(image);
        setFormData({
            url: image.url,
            altText: image.altText || '',
            productId: image.productId ? String(image.productId) : ''
        });
        window.scrollTo(0, 0); // Прокручуємо до верху, до форми
    };

    const handleDelete = async (id) => {
        if (window.confirm('Ви впевнені, що хочете видалити це зображення?')) {
            try {
                await deleteImage(id);
                alert('Зображення успішно видалено!');
                setImages(prev => prev.filter(img => img.id !== id));
            } catch (err) {
                setError('Не вдалося видалити зображення.');
            }
        }
    };

    if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

    return (
        <Container className="py-5">
            <h1 className="text-center mb-4">Керування зображеннями</h1>
            <Button variant="secondary" onClick={() => navigate('/admin')} className="mb-4">
                ← Назад до адмін-панелі
            </Button>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="mb-5 shadow-sm">
                <Card.Header as="h5">{selectedImage ? 'Редагувати зображення' : 'Створити нове зображення'}</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={12}><Form.Control name="url" value={formData.url} onChange={handleInputChange} placeholder="URL зображення" required className="mb-3" /></Col>
                            <Col md={12}><Form.Control name="altText" value={formData.altText} onChange={handleInputChange} placeholder="Альтернативний текст (Alt Text)" className="mb-3" /></Col>
                            <Col md={12}><Form.Select name="productId" value={formData.productId} onChange={handleInputChange} required className="mb-3"><option value="">Виберіть продукт</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Form.Select></Col>
                        </Row>
                        <Button type="submit">{selectedImage ? 'Оновити' : 'Створити'}</Button>
                        {selectedImage && <Button variant="outline-secondary" className="ms-2" onClick={() => { setSelectedImage(null); setFormData({ url: '', altText: '', productId: '' }); }}>Скасувати</Button>}
                    </Form>
                </Card.Body>
            </Card>

            <h2>Існуючі зображення</h2>
            <Row xs={1} sm={2} md={3} lg={4} className="g-4 mt-2">
                {images.length === 0 ? (
                    <p>Зображення не знайдені.</p>
                ) : (
                    images.map(image => (
                        <Col key={image.id}>
                            <Card className="h-100">
                                <Card.Img variant="top" src={image.url} alt={image.altText} style={{ height: '200px', objectFit: 'cover' }} />
                                <Card.Body>
                                    <Card.Text className="small"><strong>Alt:</strong> {image.altText || 'N/A'}</Card.Text>
                                    <Card.Text className="small"><strong>Product:</strong> {products.find(p => p.id === image.productId)?.name || 'N/A'}</Card.Text>
                                </Card.Body>
                                <Card.Footer>
                                    <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditClick(image)}>Редагувати</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(image.id)}>Видалити</Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </Container>
    );
};

export default ImagePage;