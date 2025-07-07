import { useState, useEffect } from 'react';

export function useCart() {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(storedCart);
    }, []);

    const updateCart = (updatedCart) => {
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const changeQuantity = (productId, quantity) => {
        if (isNaN(quantity) || quantity < 1) return;
        const updatedCart = cart.map(item =>
            item.productId === productId ? { ...item, quantity } : item
        );
        updateCart(updatedCart);
    };

    const removeItem = (productId) => {
        const updatedCart = cart.filter(item => item.productId !== productId);
        updateCart(updatedCart);
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };

    return { cart, changeQuantity, removeItem, clearCart };
}
