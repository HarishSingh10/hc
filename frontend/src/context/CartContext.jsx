import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { token, user } = useAuth();
  const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}`;

  useEffect(() => {
    if (token && user) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [token, user]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const addToCart = async (menuItem, quantity = 1) => {
    if (!token) {
      alert("Please login to add items to cart!");
      return false;
    }
    
    // Optimistic Update
    const existingIndex = cartItems.findIndex(item => item.menuItem.id === menuItem.id);
    let updatedItems = [...cartItems];
    if (existingIndex > -1) {
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + quantity
      };
    } else {
      updatedItems.push({
        id: Date.now(),
        menuItem,
        quantity
      });
    }
    setCartItems(updatedItems);

    try {
      const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ menuItemId: menuItem.id, quantity })
      });
      if (response.ok) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  };

  const updateQuantity = async (menuItemId, quantity) => {
    if (!token) return;

    // Optimistic Update
    let updatedItems = cartItems.map(item => 
      item.menuItem.id === menuItemId ? { ...item, quantity } : item
    ).filter(item => item.quantity > 0);
    setCartItems(updatedItems);

    try {
      const response = await fetch(`${API_URL}/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ menuItemId, quantity })
      });
      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  const removeFromCart = async (menuItemId) => {
    if (!token) return;

    // Optimistic Update
    let updatedItems = cartItems.filter(item => item.menuItem.id !== menuItemId);
    setCartItems(updatedItems);

    try {
      const response = await fetch(`${API_URL}/cart/remove/${menuItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const clearCart = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Calculations
  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.05; // 5% GST
  };

  const getDeliveryFee = () => {
    return getSubtotal() > 0 ? 40.00 : 0.00; // Flat 40 INR delivery fee
  };

  const getTotal = () => {
    return getSubtotal() + getTax() + getDeliveryFee();
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart,
      getSubtotal,
      getTax,
      getDeliveryFee,
      getTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
