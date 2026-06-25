import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Clock, MapPin, CheckCircle, Package, Truck, Smile, ChevronDown, ChevronUp } from 'lucide-react';
import { SkeletonOrderCard } from '../components/Skeleton';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchMyOrders();
  }, [token]);

  const fetchMyOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/orders/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        // Auto-expand the first order
        if (data.length > 0) setExpandedOrder(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = {
      'Pending Payment': 0,
      'Placed': 1,
      'Preparing': 2,
      'Out for Delivery': 3,
      'Delivered': 4
    };
    return steps[status] || 1;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending Payment': 'var(--warning)',
      'Placed': 'var(--info)',
      'Preparing': 'var(--warning)',
      'Out for Delivery': 'var(--info)',
      'Delivered': 'var(--success)'
    };
    return colors[status] || 'var(--text-muted)';
  };

  const getStatusBg = (status) => {
    const bgs = {
      'Pending Payment': 'var(--warning-light)',
      'Placed': 'var(--info-light)',
      'Preparing': 'var(--warning-light)',
      'Out for Delivery': 'var(--info-light)',
      'Delivered': 'var(--success-light)'
    };
    return bgs[status] || 'var(--border-color)';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div style={styles.container} className="page-enter">
        <h1 style={styles.pageTitle}>Your Orders</h1>
        <div style={styles.list}>
          {[1, 2, 3].map(i => <SkeletonOrderCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="page-enter">
      <h1 style={styles.pageTitle}>Your Orders</h1>

      {orders.length === 0 ? (
        <div style={styles.emptyContainer} className="premium-card-static">
          <ClipboardList size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
          <h3>No Orders Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>You haven't placed any food orders yet.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {orders.map((order, idx) => {
            const currentStep = getStatusStep(order.status);
            const isExpanded = expandedOrder === order.id;
            
            return (
              <div 
                key={order.id} 
                className="premium-card-static" 
                style={{ ...styles.orderCard, animation: `fadeInUp 0.4s ease-out ${idx * 0.08}s both` }}
              >
                {/* Header */}
                <div style={styles.cardHeader} onClick={() => toggleExpand(order.id)}>
                  <div style={styles.headerLeft}>
                    <span style={styles.orderNum}>Order #{order.id}</span>
                    <div style={styles.dateRow}>
                      <Clock size={12} />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <div style={styles.headerRight}>
                    <span style={styles.price}>₹{order.totalPrice.toFixed(2)}</span>
                    <div style={styles.badges}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusBg(order.status),
                        color: getStatusColor(order.status)
                      }}>
                        {order.status === 'Delivered' && '✅ '}{order.status}
                      </span>
                      <span style={{
                        ...styles.paymentBadge,
                        backgroundColor: order.paymentStatus === 'Completed' ? 'var(--success-light)' : 'var(--danger-light)',
                        color: order.paymentStatus === 'Completed' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <button style={styles.expandBtn}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {/* Expandable Content */}
                {isExpanded && (
                  <div style={styles.expandedContent}>
                    {/* Tracking timeline */}
                    {order.status !== 'Pending Payment' && (
                      <div style={styles.trackerSection}>
                        <div style={styles.timeline} className="timeline">
                          {[
                            { step: 1, label: 'Placed', icon: <CheckCircle size={16} /> },
                            { step: 2, label: 'Preparing', icon: <Package size={16} /> },
                            { step: 3, label: 'Out for Delivery', icon: <Truck size={16} /> },
                            { step: 4, label: 'Delivered', icon: <Smile size={16} /> },
                          ].map(({ step, label, icon }, i, arr) => (
                            <React.Fragment key={step}>
                              <div style={styles.timelineStep} className="timelineStep">
                                <div style={{
                                  ...styles.stepDot,
                                  backgroundColor: currentStep >= step ? 'var(--success)' : 'var(--border-color)',
                                  color: currentStep >= step ? 'white' : 'var(--text-light)',
                                  ...(currentStep === step ? { animation: 'pulseShadow 2s ease-in-out infinite' } : {})
                                }}>
                                  {icon}
                                </div>
                                <span style={{
                                  ...styles.stepLabel,
                                  fontWeight: currentStep === step ? '700' : '500',
                                  color: currentStep >= step ? 'var(--text-main)' : 'var(--text-light)'
                                }}>{label}</span>
                              </div>
                              
                              {i < arr.length - 1 && (
                                <div style={{
                                  ...styles.timelineLine,
                                  backgroundColor: currentStep >= step + 1 ? 'var(--success)' : 'var(--border-color)'
                                }} className="timelineLine" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Items and address */}
                    <div style={styles.orderContent} className="orderContent">
                      <div style={styles.itemsColumn} className="itemsColumn">
                        <p style={styles.contentTitle}>Items Ordered</p>
                        <div style={styles.itemList}>
                          {order.orderItems.map((item) => (
                            <div key={item.id} style={styles.itemRow}>
                              <span style={styles.itemName}>
                                {item.menuItem.name} <strong>x{item.quantity}</strong>
                              </span>
                              <span style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={styles.addressColumn}>
                        <p style={styles.contentTitle}>Delivery Location</p>
                        <div style={styles.addressBox}>
                          <MapPin size={14} color="var(--primary)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                          <p style={styles.addressText}>{order.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '90px auto 2rem auto',
    padding: '0 1.5rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '2rem',
    fontFamily: 'var(--font-title)',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '3rem 2rem',
    borderRadius: '16px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  orderCard: {
    borderRadius: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 1.75rem',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  headerLeft: {},
  orderNum: {
    fontSize: '1.15rem',
    fontWeight: '800',
    fontFamily: 'var(--font-title)',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.4rem',
  },
  price: {
    fontSize: '1.3rem',
    fontWeight: '850',
    color: 'var(--text-main)',
  },
  badges: {
    display: 'flex',
    gap: '0.4rem',
  },
  statusBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
  },
  paymentBadge: {
    fontSize: '0.68rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    marginLeft: '0.5rem',
  },
  expandedContent: {
    padding: '0 1.75rem 1.75rem',
    borderTop: '1px solid var(--border-color)',
    animation: 'fadeIn 0.3s ease-out',
  },
  trackerSection: {
    backgroundColor: 'var(--bg-main)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem',
    margin: '1.25rem 0',
  },
  timeline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 0.5rem',
  },
  timelineStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    zIndex: 1,
  },
  stepDot: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)',
    transition: 'var(--transition)',
  },
  stepLabel: {
    fontSize: '0.72rem',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  timelineLine: {
    flex: 1,
    height: '4px',
    margin: '0 -12px 22px -12px',
    transition: 'var(--transition)',
    borderRadius: '2px',
  },
  orderContent: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '2rem',
    marginTop: '0.5rem',
  },
  contentTitle: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: 'var(--text-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.75rem',
  },
  itemsColumn: {
    borderRight: '1px solid var(--border-color)',
    paddingRight: '2rem',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.88rem',
  },
  itemName: {
    color: 'var(--text-main)',
  },
  itemPrice: {
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  addressColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  addressBox: {
    display: 'flex',
    gap: '0.5rem',
  },
  addressText: {
    fontSize: '0.88rem',
    lineHeight: '1.6',
    color: 'var(--text-main)',
  }
};

export default Orders;
