import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import SidebarComp from '../components/Sidebar';
import { DollarSign, ShoppingCart, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Animated Counter Hook ── */
const useAnimatedCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target == null || target === 0) { setCount(0); return; }
    startRef.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, [token]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const animatedOrders = useAnimatedCounter(stats?.totalOrders || 0);
  const animatedRevenue = useAnimatedCounter(Math.round(stats?.totalRevenue || 0));
  const animatedItems = useAnimatedCounter(stats?.popularItems?.length || 0);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="app-container">
        <SidebarComp />
        <div className="main-content" style={styles.loadingState}>
          <span className="spinner" />
          <span>Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <SidebarComp />
      
      <div className="main-content page-enter" style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Dashboard Overview</h1>
          <p style={styles.subtitle}>Real-time stats and metrics tracking for FoodDash.</p>
        </div>

        {/* Metric Cards */}
        <div style={styles.metricsGrid}>
          <div className="premium-card" style={{ ...styles.metricCard, animation: 'fadeInUp 0.4s ease-out 0s both' }}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>Total Orders</span>
              <div style={{ ...styles.iconContainer, background: 'linear-gradient(135deg, rgba(255, 90, 54, 0.1), rgba(255, 45, 85, 0.1))', color: 'var(--primary)' }}>
                <ShoppingCart size={20} />
              </div>
            </div>
            <h2 style={styles.metricValue}>{animatedOrders}</h2>
            <p style={styles.metricSub}>Cumulative purchases placed</p>
          </div>

          <div className="premium-card" style={{ ...styles.metricCard, animation: 'fadeInUp 0.4s ease-out 0.08s both' }}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>Total Revenue</span>
              <div style={{ ...styles.iconContainer, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1))', color: 'var(--success)' }}>
                <DollarSign size={20} />
              </div>
            </div>
            <h2 style={styles.metricValue}>₹{animatedRevenue.toLocaleString()}</h2>
            <p style={styles.metricSub}>Settled & completed order totals</p>
          </div>

          <div className="premium-card" style={{ ...styles.metricCard, animation: 'fadeInUp 0.4s ease-out 0.16s both' }}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>Menu Items</span>
              <div style={{ ...styles.iconContainer, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.1))', color: 'var(--info)' }}>
                <TrendingUp size={20} />
              </div>
            </div>
            <h2 style={styles.metricValue}>{animatedItems}</h2>
            <p style={styles.metricSub}>Top dishes in menu catalog</p>
          </div>
        </div>

        <div style={styles.detailsLayout} className="detailsLayout">
          {/* Recent Orders */}
          <div className="premium-card-static" style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Recent Order Activity</h3>
              <Link to="/admin/orders" style={styles.viewAllBtn}>
                Manage Orders <ArrowUpRight size={16} />
              </Link>
            </div>
            
            {stats?.recentOrders?.length === 0 ? (
              <p style={styles.emptyText}>No recent orders available.</p>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Total</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentOrders?.map((order) => (
                      <tr key={order.id} style={styles.tr}>
                        <td style={styles.td}><strong>#{order.id}</strong></td>
                        <td style={styles.td}>{order.user?.name}</td>
                        <td style={styles.td}>{formatDate(order.createdAt)}</td>
                        <td style={{ ...styles.td, fontWeight: '700' }}>₹{order.totalPrice.toFixed(2)}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusTag,
                            backgroundColor: 
                              order.status === 'Delivered' ? 'var(--success-light)' :
                              order.status === 'Preparing' ? 'var(--warning-light)' :
                              order.status === 'Out for Delivery' ? 'var(--info-light)' :
                              'rgba(148, 163, 184, 0.1)',
                            color: 
                              order.status === 'Delivered' ? 'var(--success)' :
                              order.status === 'Preparing' ? 'var(--warning)' :
                              order.status === 'Out for Delivery' ? 'var(--info)' :
                              'var(--text-muted)'
                          }}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Popular Items */}
          <div className="premium-card-static" style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Top Selling Dishes</h3>
            </div>
            
            {stats?.popularItems?.length === 0 ? (
              <p style={styles.emptyText}>No sales statistics recorded yet.</p>
            ) : (
              <div style={styles.popularList}>
                {stats?.popularItems?.map((item, idx) => (
                  <div key={idx} style={styles.popularRow}>
                    <div style={styles.popularItemInfo}>
                      <div style={styles.rankBadge}>#{idx + 1}</div>
                      <img src={item.imageUrl} alt={item.name} style={styles.popularImg} />
                      <div>
                        <h4 style={styles.popularName}>{item.name}</h4>
                        <span style={styles.popularCat}>{item.category}</span>
                      </div>
                    </div>
                    <div style={styles.popularItemStats}>
                      <span style={styles.popularCount}>{item.orderCount} orders</span>
                      <span style={styles.popularPrice}>₹{item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { paddingTop: 'calc(70px + 1.5rem)' },
  header: { marginBottom: '2rem' },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: '2rem',
    fontWeight: '800',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.92rem',
    marginTop: '0.25rem',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2.5rem',
  },
  metricCard: { padding: '1.5rem' },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  metricLabel: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  iconContainer: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontFamily: 'var(--font-title)',
    fontSize: '2.2rem',
    fontWeight: '800',
    marginBottom: '0.25rem',
  },
  metricSub: {
    fontSize: '0.78rem',
    color: 'var(--text-light)',
  },
  detailsLayout: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '1.5rem',
  },
  tableCard: {
    padding: '1.5rem',
    borderRadius: '16px',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
  },
  tableTitle: { fontSize: '1.1rem', fontWeight: '700' },
  viewAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--primary)',
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    borderBottom: '2px solid var(--border-color)',
    color: 'var(--text-light)',
    fontSize: '0.78rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  tr: { borderBottom: '1px solid var(--border-color)' },
  td: { padding: '0.75rem 1rem', fontSize: '0.88rem' },
  statusTag: {
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: '700',
  },
  popularList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  popularRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
  },
  popularItemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  rankBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--primary)',
    backgroundColor: 'var(--primary-light)',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
  },
  popularImg: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  popularName: { fontSize: '0.92rem', fontWeight: '700' },
  popularCat: {
    fontSize: '0.72rem',
    color: 'var(--text-light)',
    backgroundColor: 'var(--bg-main)',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    display: 'inline-block',
    marginTop: '0.15rem',
  },
  popularItemStats: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.15rem',
  },
  popularCount: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  popularPrice: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    height: 'calc(100vh - 70px)',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  emptyText: {
    textAlign: 'center',
    padding: '2rem 0',
    color: 'var(--text-muted)',
  }
};

export default AdminDashboard;
