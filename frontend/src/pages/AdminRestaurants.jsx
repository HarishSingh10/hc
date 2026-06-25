import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SidebarComp from '../components/Sidebar';
import { Plus, Edit2, Trash2, X, MapPin, Store } from 'lucide-react';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { token } = useAuth();
  const { showToast } = useToast();

  useEffect(() => { fetchRestaurants(); }, [token]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/restaurants`);
      if (response.ok) { setRestaurants(await response.json()); }
    } catch (e) { console.error("Error:", e); }
    finally { setLoading(false); }
  };

  const openAddModal = () => {
    setEditing(null);
    setName(''); setDescription(''); setAddress(''); setImageUrl('');
    setShowModal(true);
  };

  const openEditModal = (r) => {
    setEditing(r);
    setName(r.name); setDescription(r.description); setAddress(r.address); setImageUrl(r.imageUrl);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !address) { showToast('Name and Address are required!', 'error'); return; }

    const payload = {
      name, description, address,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'
    };

    try {
      const url = editing ? `/api/restaurants/${editing.id}` : `/api/restaurants`;
      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        showToast(editing ? 'Restaurant updated!' : 'Restaurant created!', 'success');
        setShowModal(false);
        fetchRestaurants();
      } else { showToast('Failed to save restaurant.', 'error'); }
    } catch (error) { console.error("Error:", error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this restaurant and all its menus?")) return;
    try {
      const response = await fetch(`/api/restaurants/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showToast('Restaurant deleted!', 'success');
        fetchRestaurants();
      } else { showToast('Failed to delete.', 'error'); }
    } catch (e) { console.error("Error:", e); }
  };

  return (
    <div className="app-container">
      <SidebarComp />
      <div className="main-content page-enter" style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Manage Restaurants</h1>
            <p style={styles.subtitle}>Add, modify, or deactivate restaurant listings on the platform.</p>
          </div>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} /> Add Restaurant
          </button>
        </div>

        {loading ? (
          <div style={styles.loader}><span className="spinner" /><span>Loading restaurants...</span></div>
        ) : restaurants.length === 0 ? (
          <div style={styles.emptyCard} className="premium-card-static">
            <Store size={36} color="var(--text-light)" style={{ marginBottom: '0.5rem' }} />
            <h3>No restaurants found.</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Click "Add Restaurant" to create your first restaurant listing.</p>
          </div>
        ) : (
          <div className="grid-cols-4">
            {restaurants.map((r, idx) => (
              <div key={r.id} className="premium-card" style={{ ...styles.card, animation: `fadeInUp 0.4s ease-out ${idx * 0.06}s both` }}>
                <div style={styles.imgContainer}>
                  <img src={r.imageUrl} alt={r.name} style={styles.img} />
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{r.name}</h3>
                  <p style={styles.cardDesc}>{r.description}</p>
                  <div style={styles.addressRow}>
                    <MapPin size={14} color="var(--primary)" />
                    <span>{r.address}</span>
                  </div>
                  <div style={styles.cardActions}>
                    <button onClick={() => openEditModal(r)} className="btn btn-secondary" style={styles.smallBtn}>
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="btn btn-danger" style={styles.smallBtn}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="premium-card-static modal-card" style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editing ? 'Edit Restaurant' : 'Add New Restaurant'}</h2>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={styles.form}>
              <div className="form-group">
                <label className="form-label">Restaurant Name*</label>
                <input type="text" className="form-input" placeholder="e.g. Italian Bistro" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" placeholder="Describe the cuisine, ambiance..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ height: '70px', resize: 'none' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Address*</label>
                <input type="text" className="form-input" placeholder="Full address" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="url" className="form-input" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>
              <div style={styles.modalButtons}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
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
  loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem', color: 'var(--text-muted)' },
  emptyCard: { textAlign: 'center', padding: '3rem 2rem', borderRadius: '16px' },
  card: { display: 'flex', flexDirection: 'column' },
  imgContainer: { height: '170px', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' },
  cardBody: { padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 },
  cardTitle: { fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.4rem' },
  cardDesc: { fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '0.75rem', flex: 1 },
  addressRow: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' },
  cardActions: { display: 'flex', gap: '0.5rem' },
  smallBtn: { padding: '0.4rem 0.75rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 },
  modalCard: { width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '20px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' },
  modalTitle: { fontSize: '1.3rem', fontWeight: '700' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  modalButtons: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' },
};

export default AdminRestaurants;
