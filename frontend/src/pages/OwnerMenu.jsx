import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SidebarComp from '../components/Sidebar';
import { Plus, Edit2, Trash2, X, Utensils, Check } from 'lucide-react';

const OwnerMenu = () => {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Veg');
  const [imageUrl, setImageUrl] = useState('');
  const [available, setAvailable] = useState(true);

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Tab & Order states
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'orders'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusUpdating, setOrderStatusUpdating] = useState(null);

  const restaurant = user?.restaurant;

  useEffect(() => {
    if (restaurant) {
      if (activeTab === 'menu') {
        fetchMenuItems();
      } else {
        fetchOrders();
      }
    }
  }, [restaurant, activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/orders/restaurant/${restaurant.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        showToast('Failed to load restaurant orders.', 'error');
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast('Connection error fetching orders.', 'error');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrderStatusUpdating(orderId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        showToast(`Order status updated to: ${newStatus}`, 'success');
        fetchOrders();
      } else {
        const errMsg = await response.text();
        showToast(errMsg || 'Failed to update order status.', 'error');
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToast('Network error updating status.', 'error');
    } finally {
      setOrderStatusUpdating(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Placed':
        return { fontSize: '0.72rem', fontWeight: '700', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '6px' };
      case 'Preparing':
        return { fontSize: '0.72rem', fontWeight: '700', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '6px' };
      case 'Out for Delivery':
        return { fontSize: '0.72rem', fontWeight: '700', color: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '6px' };
      case 'Delivered':
        return { fontSize: '0.72rem', fontWeight: '700', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '6px' };
      case 'Cancelled':
      default:
        return { fontSize: '0.72rem', fontWeight: '700', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '6px' };
    }
  };

  const getPaymentStatusStyle = (paymentStatus) => {
    switch (paymentStatus) {
      case 'Completed':
        return { fontSize: '0.72rem', fontWeight: '700', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '6px', marginLeft: '0.5rem' };
      case 'Pending':
        return { fontSize: '0.72rem', fontWeight: '700', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '6px', marginLeft: '0.5rem' };
      case 'Failed':
      default:
        return { fontSize: '0.72rem', fontWeight: '700', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '6px', marginLeft: '0.5rem' };
    }
  };

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/menu-items/restaurant/${restaurant.id}`);
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      } else {
        showToast('Failed to load menu items.', 'error');
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      showToast('Connection error fetching menu items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Veg');
    setImageUrl('');
    setAvailable(true);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategory(item.category);
    setImageUrl(item.imageUrl);
    setAvailable(item.available);
    setShowModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      showToast('Name and Price are required!', 'error');
      return;
    }

    const payload = {
      name,
      description,
      price: parseFloat(price),
      category,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      available,
      restaurantId: restaurant.id
    };

    try {
      const url = editingItem 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/menu-items/${editingItem.id}` 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/menu-items`;

      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast(editingItem ? 'Dish updated successfully!' : 'New dish added to menu!', 'success');
        setShowModal(false);
        fetchMenuItems();
      } else {
        const errMsg = await response.text();
        showToast(errMsg || 'Failed to save menu item.', 'error');
      }
    } catch (error) {
      console.error("Error saving menu item:", error);
      showToast('Network error saving menu item.', 'error');
    }
  };

  const toggleStock = async (item) => {
    const payload = {
      ...item,
      available: !item.available,
      restaurantId: restaurant.id
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/menu-items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast(`${item.name} is now ${!item.available ? 'In Stock' : 'Out of Stock'}!`, 'success');
        fetchMenuItems();
      } else {
        showToast('Failed to toggle stock status.', 'error');
      }
    } catch (error) {
      console.error("Error toggling stock:", error);
      showToast('Network error toggling stock.', 'error');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to remove this dish from your menu?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/menu-items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showToast('Dish removed from menu!', 'success');
        fetchMenuItems();
      } else {
        showToast('Failed to delete dish.', 'error');
      }
    } catch (error) {
      console.error("Error deleting dish:", error);
      showToast('Connection error removing dish.', 'error');
    }
  };

  const [setupName, setSetupName] = useState('');
  const [setupAddress, setSetupAddress] = useState('');
  const [setupDesc, setSetupDesc] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  const handleSetupRestaurant = async (e) => {
    e.preventDefault();
    if (!setupName.trim()) { showToast('Restaurant name is required!', 'error'); return; }
    setSetupLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/setup-restaurant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          newRestaurantName: setupName,
          newRestaurantAddress: setupAddress,
          newRestaurantDescription: setupDesc
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`🎉 "${setupName}" is now live! Add your dishes below.`, 'success');
        // Update user in context with new restaurant
        window.location.reload();
      } else {
        showToast(data || 'Failed to create restaurant.', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setSetupLoading(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="app-container">
        <SidebarComp />
        <div className="main-content page-enter" style={{ paddingTop: 'calc(70px + 3rem)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div className="premium-card-static" style={{ width: '100%', maxWidth: '520px', padding: '2.5rem', borderRadius: '24px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏪</div>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Set Up Your Restaurant
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                You're almost there! Register your restaurant details to start managing your menu.
              </p>
            </div>

            <form onSubmit={handleSetupRestaurant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Restaurant Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Spice Garden, Biryani Hub..."
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 42 Curry Lane, Mumbai"
                  value={setupAddress}
                  onChange={(e) => setSetupAddress(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  placeholder="Tell customers what makes your food special..."
                  value={setupDesc}
                  onChange={(e) => setSetupDesc(e.target.value)}
                  style={{ height: '80px', resize: 'none' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.9rem', width: '100%' }} disabled={setupLoading}>
                {setupLoading ? <><span className="spinner spinner-sm" /> Creating...</> : '🚀 Launch My Restaurant'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Filter items locally for speed
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-container">
      <SidebarComp />
      <div className="main-content page-enter" style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              {restaurant.name} {activeTab === 'menu' ? 'Menu' : 'Orders'}
            </h1>
            <p style={styles.subtitle}>
              {activeTab === 'menu' 
                ? `Manage dishes, prices, and availability for ${restaurant.name}.`
                : `View and update statuses for orders containing items from ${restaurant.name}.`}
            </p>
          </div>
          {activeTab === 'menu' && (
            <button onClick={openAddModal} className="btn btn-primary" style={styles.addBtn}>
              <Plus size={18} /> Add Dish
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={styles.tabBar}>
          <button 
            onClick={() => setActiveTab('menu')}
            style={{
              ...styles.tabButton,
              ...(activeTab === 'menu' ? styles.activeTabButton : {})
            }}
          >
            🍽️ Menu Items
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            style={{
              ...styles.tabButton,
              ...(activeTab === 'orders' ? styles.activeTabButton : {})
            }}
          >
            📦 Restaurant Orders
          </button>
        </div>

        {activeTab === 'orders' ? (
          ordersLoading ? (
            <div style={styles.loader}>
              <span className="spinner" />
              <span>Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div style={styles.emptyContainer} className="premium-card-static">
              <h3>No orders found.</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Customers haven't placed orders containing items from your restaurant yet.
              </p>
            </div>
          ) : (
            <div style={styles.ordersList}>
              {orders.map((order) => {
                const restaurantItems = order.orderItems.filter(
                  (item) => item.menuItem.restaurant.id === restaurant.id
                );
                
                const restaurantTotal = restaurantItems.reduce(
                  (sum, item) => sum + (item.price * item.quantity), 0
                );

                return (
                  <div key={order.id} className="premium-card-static" style={styles.orderCard}>
                    <div style={styles.orderHeader}>
                      <div>
                        <div style={styles.orderIdLabel}>ORDER #{order.id}</div>
                        <div style={styles.orderTime}>
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div style={styles.orderMeta}>
                        <div style={styles.orderPriceLabel}>
                          Restaurant Share: <span style={{ color: 'var(--primary)', fontWeight: '700' }}>₹{restaurantTotal.toFixed(2)}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                            (Total: ₹{order.totalPrice.toFixed(2)})
                          </span>
                        </div>
                        <div style={styles.badgeContainer}>
                          <span style={getStatusStyle(order.status)}>{order.status}</span>
                          <span style={getPaymentStatusStyle(order.paymentStatus)}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={styles.orderBody}>
                      <div style={styles.customerSection}>
                        <h4 style={styles.sectionTitle}>Delivery Customer</h4>
                        <p style={styles.customerName}>{order.user?.name}</p>
                        <p style={styles.customerEmail}>{order.user?.email}</p>
                        <p style={styles.deliveryAddress}>
                          📍 <strong>Address:</strong> {order.address}
                        </p>
                      </div>

                      <div style={styles.itemsSection}>
                        <h4 style={styles.sectionTitle}>Ordered Items</h4>
                        <div style={styles.itemsList}>
                          {restaurantItems.map((item) => (
                            <div key={item.id} style={styles.orderItemRow}>
                              <div>
                                <span style={styles.itemNameText}>{item.menuItem?.name}</span>
                                <span style={styles.quantityText}> x {item.quantity}</span>
                              </div>
                              <span style={styles.itemPriceText}>
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={styles.orderFooter}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-light)' }}>
                          Change Status:
                        </span>
                        <select
                          className="form-input"
                          value={order.status}
                          disabled={orderStatusUpdating === order.id || order.status === 'Cancelled' || order.status === 'Delivered'}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          style={styles.statusSelect}
                        >
                          <option value="Placed">Placed</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled" disabled>Cancelled</option>
                        </select>
                        {orderStatusUpdating === order.id && <span className="spinner spinner-sm" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <>
            {/* Filters */}
            <div className="premium-card-static" style={styles.filterCard}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Search Dishes</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search by name or keyword..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ width: '200px' }}>
                <label className="form-label">Category</label>
                <select 
                  className="form-input"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Fast Food">Fast Food</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Indian">Indian</option>
                  <option value="Dessert">Dessert</option>
                </select>
              </div>
            </div>

            {/* Main List */}
            {loading ? (
              <div style={styles.loader}>
                <span className="spinner" />
                <span>Loading menu...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={styles.emptyContainer} className="premium-card-static">
                <Utensils size={36} color="var(--text-light)" style={{ marginBottom: '0.5rem' }} />
                <h3>No menu items found.</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {searchQuery || categoryFilter !== 'All' 
                    ? 'Try adjusting your search filters.' 
                    : 'Click "Add Dish" to populate your menu!'}
                </p>
              </div>
            ) : (
              <div className="premium-card-static" style={styles.tableCard}>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ ...styles.th, width: '80px' }}>Image</th>
                        <th style={styles.th}>Name & Description</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Status</th>
                        <th style={{ ...styles.th, textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="table-row">
                          <td style={styles.td}>
                            <img src={item.imageUrl} alt={item.name} style={styles.tableImg} />
                          </td>
                          <td style={styles.td}>
                            <div style={styles.itemName}>{item.name}</div>
                            <div style={styles.itemDesc}>{item.description}</div>
                          </td>
                          <td style={{ ...styles.td, fontWeight: '700' }}>₹{item.price.toFixed(2)}</td>
                          <td style={styles.td}>
                            <span className="tag">{item.category}</span>
                          </td>
                          <td style={styles.td}>
                            <div onClick={() => toggleStock(item)} style={{ cursor: 'pointer' }} title="Click to toggle availability">
                              {item.available ? (
                                <span style={styles.statusInStock}><Check size={12} /> In Stock</span>
                              ) : (
                                <span style={styles.statusOut}>Out of Stock</span>
                              )}
                            </div>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right', paddingRight: '1.5rem' }}>
                            <div style={styles.actionButtons}>
                              <button onClick={() => openEditModal(item)} style={styles.editBtn} title="Edit"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteItem(item.id)} style={styles.deleteBtn} title="Delete"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="premium-card-static modal-card" style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveItem} style={styles.modalForm}>
              <div className="form-group">
                <label className="form-label">Dish Name*</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Schezwan Fried Rice" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  placeholder="Describe the dish ingredients, spice level..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  style={{ height: '70px', resize: 'none' }} 
                />
              </div>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Price (INR)*</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    placeholder="150" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category*</label>
                  <select 
                    className="form-input" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Indian">Indian</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Dish Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="preview"
                      style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.55rem 1.1rem', borderRadius: '8px', cursor: 'pointer',
                      border: '1.5px dashed var(--primary)', color: 'var(--primary)',
                      fontWeight: '600', fontSize: '0.85rem', backgroundColor: 'rgba(255,90,54,0.05)'
                    }}>
                      📁 Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => setImageUrl(reader.result);
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      Or paste a URL below
                    </p>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="https://example.com/dish.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      style={{ marginTop: '0.35rem' }}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group" style={styles.checkboxGroup}>
                <input 
                  type="checkbox" 
                  id="availableCheck" 
                  checked={available} 
                  onChange={(e) => setAvailable(e.target.checked)} 
                  style={styles.checkbox} 
                />
                <label htmlFor="availableCheck" style={{ cursor: 'pointer', fontWeight: '500' }}>Item Available / In Stock</label>
              </div>
              <div style={styles.modalButtons}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { paddingTop: 'calc(70px + 1.5rem)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: '800' },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.25rem' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  filterCard: { padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px' },
  loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem', color: 'var(--text-muted)' },
  emptyContainer: { textAlign: 'center', padding: '3rem 2rem', borderRadius: '16px' },
  tableCard: { padding: '1.5rem', borderRadius: '16px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)', borderBottom: '1px solid var(--border-color)', letterSpacing: '0.5px' },
  td: { padding: '1rem', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle', fontSize: '0.92rem' },
  tableImg: { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' },
  itemName: { fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' },
  itemDesc: { fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4', maxWidth: '350px' },
  statusInStock: { display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', fontWeight: '700', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '6px' },
  statusOut: { fontSize: '0.72rem', fontWeight: '700', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '6px' },
  actionButtons: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' },
  editBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifycontent: 'center', transition: 'var(--transition)', hover: { backgroundColor: 'rgba(59, 130, 246, 0.05)' } },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifycontent: 'center', transition: 'var(--transition)', hover: { backgroundColor: 'rgba(239, 68, 68, 0.05)' } },
  modalCard: { width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '20px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' },
  modalTitle: { fontSize: '1.3rem', fontWeight: '700' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  formRow: { display: 'flex', gap: '1rem' },
  checkboxGroup: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  modalButtons: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' },
  
  // Tab styles
  tabBar: { display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', paddingBottom: '0.5rem' },
  tabButton: { background: 'none', border: 'none', padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '8px', transition: 'var(--transition)' },
  activeTabButton: { backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' },
  
  // Order management styles
  ordersList: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  orderCard: { padding: '1.75rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' },
  orderIdLabel: { fontSize: '1.1rem', fontWeight: '800', fontFamily: 'var(--font-title)', color: 'var(--text-main)' },
  orderTime: { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' },
  orderMeta: { textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' },
  orderPriceLabel: { fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-main)' },
  badgeContainer: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  orderBody: { display: 'flex', gap: '2rem', flexWrap: 'wrap' },
  customerSection: { flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  sectionTitle: { fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.5px', marginBottom: '0.5rem' },
  customerName: { fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' },
  customerEmail: { fontSize: '0.85rem', color: 'var(--text-muted)' },
  deliveryAddress: { fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '0.25rem', lineHeight: '1.4' },
  itemsSection: { flex: '2 1 400px', borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  orderItemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' },
  itemNameText: { fontWeight: '600', color: 'var(--text-main)' },
  quantityText: { color: 'var(--primary)', fontWeight: '700' },
  itemPriceText: { fontWeight: '700', color: 'var(--text-main)' },
  orderFooter: { borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' },
  statusSelect: { padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', width: '180px', height: '36px' }
};

export default OwnerMenu;
