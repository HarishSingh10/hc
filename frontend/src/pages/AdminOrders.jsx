import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SidebarComp from '../components/Sidebar';
import { Calendar, User, MapPin } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { showToast } = useToast();

  const statuses = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];

  useEffect(() => { fetchAllOrders(); }, [token]);

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) { setOrders(await response.json()); }
    } catch (e) { console.error("Error fetching orders:", e); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        showToast(`Order #${orderId} updated to "${newStatus}"`, 'success');
        fetchAllOrders();
      } else { showToast('Failed to update order status.', 'error'); }
    } catch (error) { console.error("Error changing status:", error); }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusStyle = (status) => {
    const map = {
      'Placed': { bg: 'var(--info-light)', color: 'var(--info)' },
      'Preparing': { bg: 'var(--warning-light)', color: 'var(--warning)' },
      'Out for Delivery': { bg: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' },
      'Delivered': { bg: 'var(--success-light)', color: 'var(--success)' },
      'Pending Payment': { bg: 'var(--danger-light)', color: 'var(--danger)' },
    };
    return map[status] || { bg: 'var(--border-color)', color: 'var(--text-muted)' };
  };

  if (loading && orders.length === 0) {
    return (
      <div className="app-container">
        <SidebarComp />
        <div className="main-content" style={styles.loadingState}>
          <span className="spinner" />
          <span>Fetching orders ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <SidebarComp />
      <div className="main-content page-enter" style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Manage Orders</h1>
          <p style={styles.subtitle}>Update progress tracking states and review billing ledgers.</p>
        </div>

        {orders.length === 0 ? (
          <div style={styles.emptyCard} className="premium-card-static">
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📦</span>
            <h3>No orders placed yet.</h3>
            <p style={{ color: 'var(--text-muted)' }}>As soon as customers check out, their orders will appear here.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {orders.map((order, idx) => {
              const statusStyle = getStatusStyle(order.status);
              return (
                <div key={order.id} className="premium-card-static" style={{ ...styles.orderCard, animation: `fadeInUp 0.4s ease-out ${idx * 0.06}s both` }}>
                  <div style={styles.orderHeader} className="orderHeader">
                    <div>
                      <h3 style={styles.orderId}>Order #{order.id}</h3>
                      <div style={styles.metaRow}>
                        <span style={styles.metaItem}><User size={14} /> {order.user?.name} ({order.user?.email})</span>
                        <span style={styles.metaItem}><Calendar size={14} /> {formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div style={styles.statusControlCard}>
                      <div style={{ ...styles.statusDot, backgroundColor: statusStyle.bg }}>
                        <span style={{ color: statusStyle.color, fontSize: '0.72rem', fontWeight: '700' }}>{order.status}</span>
                      </div>
                      <select className="form-input" style={styles.statusSelect} value={order.status}
                        disabled={order.status === 'Pending Payment'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                        {order.status === 'Pending Payment' && <option value="Pending Payment">Pending Payment</option>}
                        {statuses.map(st => (<option key={st} value={st}>{st}</option>))}
                      </select>
                    </div>
                  </div>

                  <div style={styles.orderContent} className="orderContent">
                    <div style={styles.detailsCol} className="detailsCol">
                      <p style={styles.sectionTitle}>Ordered Items</p>
                      <div style={styles.itemsList}>
                        {order.orderItems.map((item) => (
                          <div key={item.id} style={styles.itemRow}>
                            <span>{item.menuItem.name} <strong>x{item.quantity}</strong></span>
                            <span style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={styles.addressCol}>
                      <p style={styles.sectionTitle}>Delivery Details</p>
                      <div style={styles.addressBox}>
                        <MapPin size={14} color="var(--primary)" style={{ marginTop: '0.25rem', flexShrink: 0 }} />
                        <p style={styles.addressText}>{order.address}</p>
                      </div>
                      <div style={styles.billSummary}>
                        <div style={styles.billRow}>
                          <span>Payment:</span>
                          <span style={{ fontWeight: '700', color: order.paymentStatus === 'Completed' ? 'var(--success)' : 'var(--danger)' }}>{order.paymentStatus}</span>
                        </div>
                        <div style={styles.billRow}>
                          <span>Total:</span>
                          <span style={styles.totalPrice}>₹{order.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { paddingTop: '20px' },
  header: { marginBottom: '2rem' },
  title: { fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: '800' },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.25rem' },
  loadingState: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem', height: 'calc(100vh - 70px)', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' },
  emptyCard: { padding: '3rem 2rem', textAlign: 'center', borderRadius: '16px' },
  list: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  orderCard: { padding: '1.75rem', borderRadius: '16px' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' },
  orderId: { fontSize: '1.2rem', fontWeight: '800' },
  metaRow: { display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  statusControlCard: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  statusDot: { padding: '0.25rem 0.65rem', borderRadius: '8px' },
  statusSelect: { width: '170px', fontSize: '0.85rem', padding: '0.5rem 0.75rem' },
  orderContent: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' },
  sectionTitle: { fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' },
  detailsCol: { borderRight: '1px solid var(--border-color)', paddingRight: '2rem' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  itemRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' },
  addressCol: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  addressBox: { display: 'flex', gap: '0.5rem' },
  addressText: { fontSize: '0.88rem', lineHeight: '1.6' },
  billSummary: { marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  billRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' },
  totalPrice: { fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' },
};

export default AdminOrders;
