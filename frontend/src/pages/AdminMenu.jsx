import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SidebarComp from '../components/Sidebar';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

const AdminMenu = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Veg');
  const [available, setAvailable] = useState(true);

  useEffect(() => { fetchRestaurants(); }, [token]);

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchMenuItems(selectedRestaurantId);
    } else {
      setMenuItems([]);
    }
  }, [selectedRestaurantId]);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/restaurants`);
      if (response.ok) {
        const data = await response.json();
        setRestaurants(data);
        if (data.length > 0) setSelectedRestaurantId(data[0].id.toString());
      }
    } catch (e) { console.error("Error fetching restaurants:", e); }
  };

  const fetchMenuItems = async (restaurantId) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/menu-items/restaurant/${restaurantId}`);
      if (response.ok) { setMenuItems(await response.json()); }
    } catch (e) { console.error("Error fetching menus:", e); }
    finally { setLoading(false); }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setName(''); setDescription(''); setPrice(''); setImageUrl(''); setCategory('Veg'); setAvailable(true);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setName(item.name); setDescription(item.description); setPrice(item.price.toString());
    setImageUrl(item.imageUrl); setCategory(item.category); setAvailable(item.available);
    setShowModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!name || !price || !category) { showToast('Please fill in required fields!', 'error'); return; }

    const payload = {
      name, description, price: parseFloat(price),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      category, available, restaurantId: parseInt(selectedRestaurantId)
    };

    try {
      const url = editingItem ? `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/menu-items/${editingItem.id}` : `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/menu-items`;
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast(editingItem ? 'Menu item updated successfully!' : 'Menu item added successfully!', 'success');
        setShowModal(false);
        fetchMenuItems(selectedRestaurantId);
      } else {
        showToast('Failed to save menu item.', 'error');
      }
    } catch (error) { console.error("Error saving menu item:", error); }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/menu-items/${itemId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showToast('Menu item deleted successfully!', 'success');
        fetchMenuItems(selectedRestaurantId);
      } else { showToast('Failed to delete menu item.', 'error'); }
    } catch (e) { console.error("Error deleting item:", e); }
  };

  return (
    <div className="app-container">
      <SidebarComp />
      <div className="main-content page-enter" style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Manage Menu Items</h1>
            <p style={styles.subtitle}>Update and organize dish catalogs across active restaurants.</p>
          </div>
          <button onClick={openAddModal} className="btn btn-primary" style={styles.addBtn}>
            <Plus size={18} /> Add Menu Item
          </button>
        </div>

        <div className="premium-card-static" style={styles.filterCard}>
          <label style={styles.filterLabel}>Select Restaurant:</label>
          <select className="form-input" style={styles.filterSelect} value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}>
            {restaurants.map(r => (<option key={r.id} value={r.id}>{r.name} - {r.address}</option>))}
          </select>
        </div>

        {loading ? (
          <div style={styles.loader}><span className="spinner" /><span>Loading menu items...</span></div>
        ) : menuItems.length === 0 ? (
          <div style={styles.emptyContainer} className="premium-card-static">
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🍽️</span>
            <h3>No menu items found.</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Click "Add Menu Item" to build this restaurant's menu.</p>
          </div>
        ) : (
          <div style={styles.tableCard} className="premium-card-static">
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Image</th>
                    <th style={styles.th}>Dish Name</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}><img src={item.imageUrl} alt={item.name} style={styles.itemImg} /></td>
                      <td style={styles.td}>
                        <div style={styles.nameCell}><strong>{item.name}</strong><span style={styles.descText}>{item.description}</span></div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.categoryTag,
                          backgroundColor: item.category === 'Veg' ? 'var(--success-light)' : 'var(--danger-light)',
                          color: item.category === 'Veg' ? 'var(--success)' : 'var(--danger)'
                        }}>{item.category}</span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: '700' }}>₹{item.price.toFixed(2)}</td>
                      <td style={styles.td}>
                        {item.available ? (
                          <span style={styles.statusInStock}><Check size={12} /> In Stock</span>
                        ) : (<span style={styles.statusOut}>Out of Stock</span>)}
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
      </div>

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
                <input type="text" className="form-input" placeholder="e.g. Garlic Herb Pasta" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" placeholder="Detail the ingredients, taste..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ height: '70px', resize: 'none' }} />
              </div>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Price (INR)*</label>
                  <input type="number" step="0.01" className="form-input" placeholder="150" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category*</label>
                  <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Veg">Veg</option><option value="Non-Veg">Non-Veg</option>
                    <option value="Fast Food">Fast Food</option><option value="Chinese">Chinese</option>
                    <option value="Indian">Indian</option><option value="Dessert">Dessert</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="url" className="form-input" placeholder="https://example.com/food.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>
              <div className="form-group" style={styles.checkboxGroup}>
                <input type="checkbox" id="availableCheck" checked={available} onChange={(e) => setAvailable(e.target.checked)} style={styles.checkbox} />
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: '800' },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.25rem' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  filterCard: { padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px' },
  filterLabel: { fontWeight: '600', fontSize: '0.92rem', whiteSpace: 'nowrap' },
  filterSelect: { maxWidth: '350px' },
  loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem', color: 'var(--text-muted)' },
  emptyContainer: { textAlign: 'center', padding: '3rem 2rem', borderRadius: '16px' },
  tableCard: { padding: '1.5rem', borderRadius: '16px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' },
  tr: { borderBottom: '1px solid var(--border-color)' },
  td: { padding: '0.75rem 1rem', fontSize: '0.88rem', verticalAlign: 'middle' },
  itemImg: { width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' },
  nameCell: { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  descText: { fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  categoryTag: { padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' },
  statusInStock: { display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.78rem', fontWeight: '600' },
  statusOut: { color: 'var(--danger)', fontSize: '0.78rem', fontWeight: '600' },
  actionButtons: { display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' },
  editBtn: { background: 'none', border: '1.5px solid var(--border-color)', color: 'var(--info)', cursor: 'pointer', padding: '0.35rem', borderRadius: '6px', transition: 'var(--transition)', display: 'flex' },
  deleteBtn: { background: 'none', border: '1.5px solid var(--border-color)', color: 'var(--danger)', cursor: 'pointer', padding: '0.35rem', borderRadius: '6px', transition: 'var(--transition)', display: 'flex' },
  modalCard: { width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '20px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' },
  modalTitle: { fontSize: '1.3rem', fontWeight: '700' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  formRow: { display: 'flex', gap: '1rem' },
  checkboxGroup: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  modalButtons: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' },
};

export default AdminMenu;
