import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}`;

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchProfile(token);
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async (jwtToken) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Profile now returns AuthResponse shape: {token, id, name, email, role, restaurant}
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          restaurant: data.restaurant || null,
          addresses: data.addresses || []
        });
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Invalid credentials');
      }

      const data = await response.json();
      setToken(data.token);
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        restaurant: data.restaurant,
        addresses: []
      });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password, role = 'CUSTOMER', restaurantId = null, newRestaurant = null) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role, 
          restaurantId,
          newRestaurantName: newRestaurant?.name || null,
          newRestaurantAddress: newRestaurant?.address || null,
          newRestaurantDescription: newRestaurant?.description || null
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        restaurant: data.restaurant,
        addresses: []
      });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setLoading(false);
  };

  const addAddress = async (newAddress) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/auth/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });
      if (response.ok) {
        const updatedAddresses = await response.json();
        setUser(prev => ({ ...prev, addresses: updatedAddresses }));
      }
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  const removeAddress = async (addressToRemove) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/auth/addresses?address=${encodeURIComponent(addressToRemove)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const updatedAddresses = await response.json();
        setUser(prev => ({ ...prev, addresses: updatedAddresses }));
      }
    } catch (error) {
      console.error("Error removing address:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, addAddress, removeAddress, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
