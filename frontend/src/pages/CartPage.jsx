import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, Truck } from 'lucide-react';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getSubtotal, getTax, getDeliveryFee, getTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedAddress, setSelectedAddress] = useState(user?.addresses?.[0] || '');
  const [newAddress, setNewAddress] = useState('');
  const [addingAddress, setAddingAddress] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockPaymentDetails, setMockPaymentDetails] = useState({
    orderId: null,
    razorpayOrderId: '',
    amount: 0
  });

  const { addAddress } = useAuth();

  const FREE_DELIVERY_THRESHOLD = 500;
  const subtotal = getSubtotal();
  const deliveryProgress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const amountForFree = FREE_DELIVERY_THRESHOLD - subtotal;

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    await addAddress(newAddress.trim());
    setSelectedAddress(newAddress.trim());
    setNewAddress('');
    setAddingAddress(false);
    showToast('Address saved successfully!', 'success');
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      showToast('Please select or add a delivery address!', 'error');
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ address: selectedAddress })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const orderData = await response.json();

      if (orderData.mock) {
        setMockPaymentDetails({
          orderId: orderData.orderId,
          razorpayOrderId: orderData.razorpayOrderId,
          amount: orderData.amount
        });
        setShowMockModal(true);
      } else {
        const options = {
          key: orderData.keyId,
          amount: Math.round(orderData.amount * 100),
          currency: orderData.currency,
          name: "FoodDash",
          description: "Online Food Order Checkout",
          order_id: orderData.razorpayOrderId,
          handler: async function (response) {
            await verifyPayment({
              orderId: orderData.orderId,
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
          },
          prefill: {
            name: user.name,
            email: user.email
          },
          theme: {
            color: "#ff5a36"
          },
          modal: {
            ondismiss: function() {
              setCheckoutLoading(false);
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      showToast('Checkout failed: ' + error.message, 'error');
      setCheckoutLoading(false);
    }
  };

  const verifyPayment = async (verificationPayload) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/orders/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(verificationPayload)
      });

      if (res.ok) {
        showToast('🎉 Order placed successfully! Tracking details loaded.', 'success');
        setShowMockModal(false);
        navigate('/orders');
      } else {
        showToast('Payment verification failed!', 'error');
      }
    } catch (e) {
      showToast('Error during verification: ' + e.message, 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={styles.emptyContainer} className="page-enter">
        <div style={styles.emptyIcon}>
          <ShoppingBag size={48} color="var(--text-light)" />
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '340px', lineHeight: '1.6' }}>
          Add delicious meals from our premium restaurants to get started.
        </p>
        <Link to="/" className="btn btn-primary">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.container} className="page-enter">
      <h1 style={styles.pageTitle}>Your Cart</h1>

      {/* Free Delivery Progress */}
      <div style={styles.deliveryBanner} className="premium-card-static">
        <div style={styles.deliveryInfo}>
          <Truck size={18} color={subtotal >= FREE_DELIVERY_THRESHOLD ? 'var(--success)' : 'var(--primary)'} />
          {subtotal >= FREE_DELIVERY_THRESHOLD ? (
            <span style={styles.deliveryText}>
              🎉 You've unlocked <strong style={{ color: 'var(--success)' }}>FREE delivery!</strong>
            </span>
          ) : (
            <span style={styles.deliveryText}>
              Add <strong style={{ color: 'var(--primary)' }}>₹{amountForFree.toFixed(0)}</strong> more for free delivery
            </span>
          )}
        </div>
        <div className="delivery-progress-track">
          <div className="delivery-progress-fill" style={{ width: `${deliveryProgress}%` }} />
        </div>
      </div>

      <div style={styles.layout}>
        {/* Cart items list */}
        <div style={styles.cartList}>
          {cartItems.map((item, idx) => (
            <div 
              key={item.id} 
              className="premium-card" 
              style={{ ...styles.cartCard, animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both` }}
            >
              <img src={item.menuItem.imageUrl} alt={item.menuItem.name} style={styles.cartImg} />
              
              <div style={styles.cartInfo}>
                <div>
                  <h3 style={styles.cartName}>{item.menuItem.name}</h3>
                  <p style={styles.cartRest}>From: {item.menuItem.restaurant.name}</p>
                </div>
                <div style={styles.priceRow}>
                  <span style={styles.unitPrice}>₹{item.menuItem.price.toFixed(2)} each</span>
                </div>
              </div>

              <div style={styles.qtyContainer}>
                <div style={styles.qtyControl}>
                  <button 
                    onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)} 
                    style={styles.qtyBtn}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={styles.qtyText}>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)} 
                    style={styles.qtyBtn}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span style={styles.totalPrice}>₹{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                
                <button 
                  onClick={() => {
                    removeFromCart(item.menuItem.id);
                    showToast(`${item.menuItem.name} removed from cart.`, 'info');
                  }}
                  style={styles.deleteBtn}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => {
              clearCart();
              showToast('Cart cleared.', 'info');
            }} 
            style={styles.clearBtn} 
            className="btn btn-secondary"
          >
            Clear Cart
          </button>
        </div>

        {/* Checkout */}
        <div style={styles.summarySection}>
          {/* Address */}
          <div className="premium-card-static" style={styles.summaryCard}>
            <h3 style={styles.cardHeader}>1. Delivery Address</h3>
            
            {!addingAddress ? (
              <div style={styles.addressBox}>
                {user?.addresses && user.addresses.length > 0 ? (
                  <div className="form-group">
                    <label className="form-label">Select Address</label>
                    <select 
                      className="form-input"
                      value={selectedAddress}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                    >
                      {user.addresses.map((addr, idx) => (
                        <option key={idx} value={addr}>{addr}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p style={styles.noAddress}>No addresses saved. Please add a new delivery address.</p>
                )}

                <button 
                  onClick={() => setAddingAddress(true)} 
                  style={styles.addNewAddrBtn}
                >
                  + Add New Address
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddAddress} style={styles.addressForm}>
                <div className="form-group">
                  <label className="form-label">Full Address</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Enter flat number, building, street, area, pincode..."
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    required
                    style={{ height: '80px', resize: 'none' }}
                  />
                </div>
                <div style={styles.formActions}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setAddingAddress(false)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  >
                    Save & Select
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bill */}
          <div className="premium-card-static" style={styles.summaryCard}>
            <h3 style={styles.cardHeader}>2. Bill Details</h3>
            
            <div style={styles.billRow}>
              <span>Subtotal</span>
              <span>₹{getSubtotal().toFixed(2)}</span>
            </div>
            <div style={styles.billRow}>
              <span>Taxes (5% GST)</span>
              <span>₹{getTax().toFixed(2)}</span>
            </div>
            <div style={styles.billRow}>
              <span>Delivery Charges</span>
              <span style={subtotal >= FREE_DELIVERY_THRESHOLD ? { color: 'var(--success)', fontWeight: '600' } : {}}>
                {subtotal >= FREE_DELIVERY_THRESHOLD ? 'FREE' : `₹${getDeliveryFee().toFixed(2)}`}
              </span>
            </div>
            
            <div style={styles.divider}></div>
            
            <div style={{ ...styles.billRow, ...styles.grandTotalRow }}>
              <span>To Pay</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>

            <button 
              onClick={handleCheckout} 
              className="btn btn-primary" 
              style={styles.checkoutBtn}
              disabled={checkoutLoading || !selectedAddress}
            >
              {checkoutLoading ? (
                <>
                  <span className="spinner spinner-sm" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Proceed to Pay (₹{getTotal().toFixed(2)})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mock Payment Modal */}
      {showMockModal && (
        <div className="modal-overlay">
          <div className="premium-card-static modal-card" style={styles.modalCard}>
            <h2 style={styles.modalTitle}>💳 Payment Simulator</h2>
            <p style={styles.modalSub}>Mock payment mode — no real charges applied.</p>
            
            <div style={styles.modalDetails}>
              <div style={styles.detailRow}>
                <span>Order Reference:</span>
                <strong>{mockPaymentDetails.razorpayOrderId}</strong>
              </div>
              <div style={styles.detailRow}>
                <span>Internal ID:</span>
                <strong>#{mockPaymentDetails.orderId}</strong>
              </div>
              <div style={styles.detailRow}>
                <span>Amount:</span>
                <strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>₹{mockPaymentDetails.amount.toFixed(2)}</strong>
              </div>
            </div>

            <div style={styles.alertBanner}>
              This simulator verifies the payment pipeline without charging real money.
            </div>

            <div style={styles.modalButtons}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowMockModal(false);
                  setCheckoutLoading(false);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  verifyPayment({
                    orderId: mockPaymentDetails.orderId,
                    paymentId: 'pay_mock_' + Math.random().toString(36).substring(2, 16),
                    razorpayOrderId: mockPaymentDetails.razorpayOrderId
                  });
                }}
              >
                ✅ Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '90px auto 2rem auto',
    padding: '0 1.5rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '1.5rem',
    fontFamily: 'var(--font-title)',
  },
  deliveryBanner: {
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    marginBottom: '2rem',
  },
  deliveryInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.6rem',
  },
  deliveryText: {
    fontSize: '0.88rem',
    color: 'var(--text-main)',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2.5rem',
  },
  cartList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cartCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.25rem',
    gap: '1.25rem',
  },
  cartImg: {
    width: '85px',
    height: '85px',
    borderRadius: '12px',
    objectFit: 'cover',
  },
  cartInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '75px',
  },
  cartName: {
    fontSize: '1.05rem',
    fontWeight: '700',
  },
  cartRest: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '0.15rem',
  },
  priceRow: {
    marginTop: 'auto',
  },
  unitPrice: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  qtyContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  qtyControl: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-main)',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-main)',
    transition: 'var(--transition)',
  },
  qtyText: {
    fontSize: '0.88rem',
    fontWeight: '700',
    width: '24px',
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: '1.1rem',
    fontWeight: '800',
    width: '90px',
    textAlign: 'right',
  },
  deleteBtn: {
    background: 'none',
    border: '2px solid var(--border-color)',
    color: 'var(--danger)',
    cursor: 'pointer',
    padding: '0.4rem',
    borderRadius: '8px',
    transition: 'var(--transition)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    alignSelf: 'flex-start',
    padding: '0.5rem 1rem',
    fontSize: '0.88rem',
    marginTop: '0.5rem',
  },
  summarySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  summaryCard: {
    padding: '1.5rem',
    borderRadius: '16px',
  },
  cardHeader: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '1.25rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
  },
  addressBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  noAddress: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  addNewAddrBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    textAlign: 'left',
    width: 'fit-content',
  },
  addressForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
  billRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.92rem',
    color: 'var(--text-muted)',
    marginBottom: '0.75rem',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '0.75rem 0',
  },
  grandTotalRow: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  checkoutBtn: {
    width: '100%',
    marginTop: '1.25rem',
    padding: '0.85rem',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '2rem',
    marginTop: '70px',
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-main)',
    border: '2px dashed var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  modalCard: {
    width: '100%',
    maxWidth: '480px',
    padding: '2.5rem',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '850',
    marginBottom: '0.4rem',
  },
  modalSub: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    marginBottom: '1.5rem',
  },
  modalDetails: {
    backgroundColor: 'var(--bg-main)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.88rem',
  },
  alertBanner: {
    fontSize: '0.78rem',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    color: 'var(--warning)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(245, 158, 11, 0.15)',
    fontWeight: '500',
    marginBottom: '1.5rem',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  }
};

export default CartPage;
