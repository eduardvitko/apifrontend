import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/images'; // Adjust if your backend runs on a different port/host

const ImagePage = () => {
    const [images, setImages] = useState([]);
    const [products, setProducts] = useState([]); // To display available products for linking images
    const [selectedImage, setSelectedImage] = useState(null); // For editing
    const [formData, setFormData] = useState({
        url: '',
        altText: '',
        productId: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Dummy ADMIN token for demonstration.
    // In a real app, this would come from your authentication context/state.
    const ADMIN_TOKEN = 'YOUR_ADMIN_JWT_TOKEN_HERE'; // *** IMPORTANT: Replace with a real token for ADMIN operations ***

    const authHeaders = {
        headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`
        }
    };

    useEffect(() => {
        fetchImages();
        fetchProducts(); // Assuming you have a Product API to get product IDs
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        setError('');
        try {
            // For fetching all images, your controller endpoint /api/images/all has no @PreAuthorize
            // so it might be accessible to anyone. If you add security later, you'd need headers.
            const response = await axios.get(`${API_BASE_URL}/all`);
            setImages(response.data);
        } catch (err) {
            setError('Error fetching images: ' + (err.response?.data || err.message));
            console.error('Error fetching images:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        // Assuming you have a product endpoint like /api/products/all or similar
        // Adjust this URL and headers as needed for your Product API
        try {
            const response = await axios.get('http://localhost:8080/api/products/all', authHeaders); // Assuming product fetching might need auth
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
            // setError('Error fetching products: ' + (err.response?.data || err.message));
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateImage = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const dataToSend = {
                ...formData,
                productId: parseInt(formData.productId, 10) // Ensure productId is an integer
            };
            const response = await axios.post(API_BASE_URL, dataToSend, authHeaders);
            setImages([...images, response.data]);
            setFormData({ url: '', altText: '', productId: '' }); // Clear form
            alert('Image created successfully!');
        } catch (err) {
            setError('Error creating image: ' + (err.response?.data || err.message));
            console.error('Error creating image:', err);
        }
    };

    const handleEditClick = (image) => {
        setSelectedImage(image);
        setFormData({
            url: image.url,
            altText: image.altText,
            productId: image.productId
        });
    };

    const handleUpdateImage = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedImage) return;

        try {
            const dataToSend = {
                ...formData,
                id: selectedImage.id, // Include ID for DTO if backend expects it (though path variable is used)
                productId: parseInt(formData.productId, 10)
            };
            const response = await axios.put(`${API_BASE_URL}/update/${selectedImage.id}`, dataToSend, authHeaders);
            setImages(images.map(img => img.id === selectedImage.id ? response.data : img));
            setSelectedImage(null); // Exit edit mode
            setFormData({ url: '', altText: '', productId: '' }); // Clear form
            alert('Image updated successfully!');
        } catch (err) {
            setError('Error updating image: ' + (err.response?.data || err.message));
            console.error('Error updating image:', err);
        }
    };

    const handleDeleteImage = async (id) => {
        setError('');
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await axios.delete(`${API_BASE_URL}/delete/${id}`, authHeaders);
                setImages(images.filter(img => img.id !== id));
                alert('Image deleted successfully!');
            } catch (err) {
                setError('Error deleting image: ' + (err.response?.data || err.message));
                console.error('Error deleting image:', err);
            }
        }
    };

    if (loading) return <div>Loading images...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <h1>Image Management</h1>

            <div style={styles.formSection}>
                <h2>{selectedImage ? 'Edit Image' : 'Create New Image'}</h2>
                <form onSubmit={selectedImage ? handleUpdateImage : handleCreateImage} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label htmlFor="url">Image URL:</label>
                        <input
                            type="text"
                            id="url"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="altText">Alt Text:</label>
                        <input
                            type="text"
                            id="altText"
                            name="altText"
                            value={formData.altText}
                            onChange={handleInputChange}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="productId">Product:</label>
                        <select
                            id="productId"
                            name="productId"
                            value={formData.productId}
                            onChange={handleInputChange}
                            required
                            style={styles.select}
                        >
                            <option value="">Select a Product</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} (ID: {product.id})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" style={styles.button}>
                        {selectedImage ? 'Update Image' : 'Create Image'}
                    </button>
                    {selectedImage && (
                        <button type="button" onClick={() => {
                            setSelectedImage(null);
                            setFormData({ url: '', altText: '', productId: '' });
                        }} style={{ ...styles.button, backgroundColor: '#6c757d' }}>
                            Cancel Edit
                        </button>
                    )}
                </form>
            </div>

            <div style={styles.imageListSection}>
                <h2>Existing Images</h2>
                <div style={styles.imageList}>
                    {images.length === 0 ? (
                        <p>No images found.</p>
                    ) : (
                        images.map(image => (
                            <div key={image.id} style={styles.imageCard}>
                                <img src={image.url} alt={image.altText} style={styles.imageThumbnail} />
                                <div style={styles.imageDetails}>
                                    <h3>ID: {image.id}</h3>
                                    <p><strong>URL:</strong> {image.url}</p>
                                    <p><strong>Alt Text:</strong> {image.altText || 'N/A'}</p>
                                    <p><strong>Product ID:</strong> {image.productId}</p>
                                </div>
                                <div style={styles.imageActions}>
                                    <button onClick={() => handleEditClick(image)} style={{ ...styles.button, backgroundColor: '#007bff' }}>Edit</button>
                                    <button onClick={() => handleDeleteImage(image.id)} style={{ ...styles.button, backgroundColor: '#dc3545' }}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    },
    formSection: {
        backgroundColor: '#ffffff',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        marginBottom: '30px'
    },
    form: {
        display: 'grid',
        gap: '15px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    input: {
        padding: '10px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '1em'
    },
    select: {
        padding: '10px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '1em',
        backgroundColor: '#fff'
    },
    button: {
        padding: '10px 15px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#28a745',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1em',
        marginTop: '10px',
        marginRight: '10px'
    },
    imageListSection: {
        backgroundColor: '#ffffff',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    imageList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
    },
    imageCard: {
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    },
    imageThumbnail: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        display: 'block',
        borderBottom: '1px solid #e9ecef'
    },
    imageDetails: {
        padding: '15px',
        flexGrow: 1
    },
    imageActions: {
        padding: '15px',
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        gap: '10px'
    }
};

export default ImagePage;