import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, User, UserPlus, LogIn, Utensils, Store } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [newRestName, setNewRestName] = useState('');
  const [newRestAddress, setNewRestAddress] = useState('');
  const [newRestDesc, setNewRestDesc] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isRegister) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/restaurants`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setRestaurants(data);
          if (data.length > 0) {
            setSelectedRestaurantId(data[0].id.toString());
          } else {
            setSelectedRestaurantId('NEW_RESTAURANT');
          }
        })
        .catch(err => console.error("Error loading restaurants:", err));
    }
  }, [isRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const isNewRest = selectedRestaurantId === 'NEW_RESTAURANT';
        const rId = role === 'SHOP_OWNER' && !isNewRest ? parseInt(selectedRestaurantId) : null;
        const newRestObj = role === 'SHOP_OWNER' && isNewRest ? {
          name: newRestName,
          address: newRestAddress,
          description: newRestDesc
        } : null;

        await register(name, email, password, role, rId, newRestObj);
        showToast('Registration successful! Welcome to FoodDash.', 'success');
      } else {
        const response = await login(email, password);
        showToast('Welcome back! You\'re signed in.', 'success');
        if (response.role === 'ADMIN') {
          navigate('/admin');
          return;
        } else if (response.role === 'SHOP_OWNER') {
          navigate('/owner');
          return;
        }
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      showToast(err.message || 'Authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="page-enter">
      {/* Floating food icons background */}
      <div style={styles.floatingBg}>
        <span style={{ ...styles.floatIcon, top: '10%', left: '5%', animationDelay: '0s' }}>🍕</span>
        <span style={{ ...styles.floatIcon, top: '20%', right: '10%', animationDelay: '0.5s' }}>🍔</span>
        <span style={{ ...styles.floatIcon, bottom: '15%', left: '8%', animationDelay: '1s' }}>🍜</span>
        <span style={{ ...styles.floatIcon, bottom: '25%', right: '5%', animationDelay: '1.5s' }}>🥗</span>
        <span style={{ ...styles.floatIcon, top: '50%', left: '15%', animationDelay: '0.7s' }}>🍰</span>
        <span style={{ ...styles.floatIcon, top: '40%', right: '15%', animationDelay: '1.2s' }}>🧁</span>
      </div>

      <div style={styles.card} className="premium-card-static modal-card">
        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logoCircle}>
            <Utensils size={24} />
          </div>
          <span style={styles.logoText}>Food<span className="gradient-text">Dash</span></span>
        </div>

        {/* Tab Switcher */}
        <div className="tab-switcher" style={styles.tabs}>
          <button 
            type="button"
            className={`tab-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); setError(''); }}
          >
            <LogIn size={16} style={{ marginRight: '0.3rem' }} />
            Sign In
          </button>
          <button 
            type="button"
            className={`tab-btn ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); setError(''); }}
          >
            <UserPlus size={16} style={{ marginRight: '0.3rem' }} />
            Sign Up
          </button>
        </div>

        <div style={styles.cardHeader}>
          <h2 style={styles.title}>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p style={styles.subtitle}>
            {isRegister ? 'Join FoodDash and order delicious meals' : 'Sign in to track orders and browse menus'}
          </p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.inputIcon} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={styles.paddedInput}
                  placeholder="John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input 
                type="email" 
                className="form-input" 
                style={styles.paddedInput}
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input 
                type="password" 
                className="form-input" 
                style={styles.paddedInput}
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Register As</label>
              <div style={styles.roleCards}>
                <label 
                  style={{
                    ...styles.roleCard,
                    ...(role === 'CUSTOMER' ? styles.roleCardActive : {})
                  }}
                >
                  <input 
                    type="radio" 
                    name="role" 
                    value="CUSTOMER" 
                    checked={role === 'CUSTOMER'} 
                    onChange={() => setRole('CUSTOMER')} 
                    style={{ display: 'none' }}
                  />
                  <span style={styles.roleEmoji}>🛒</span>
                  <span style={styles.roleTitle}>Customer</span>
                  <span style={styles.roleDesc}>Order Food</span>
                </label>
                <label 
                  style={{
                    ...styles.roleCard,
                    ...(role === 'SHOP_OWNER' ? styles.roleCardActive : {})
                  }}
                >
                  <input 
                    type="radio" 
                    name="role" 
                    value="SHOP_OWNER" 
                    checked={role === 'SHOP_OWNER'} 
                    onChange={() => setRole('SHOP_OWNER')} 
                    style={{ display: 'none' }}
                  />
                  <span style={styles.roleEmoji}>🏪</span>
                  <span style={styles.roleTitle}>Shop Owner</span>
                  <span style={styles.roleDesc}>Manage Menu</span>
                </label>
                <label 
                  style={{
                    ...styles.roleCard,
                    ...(role === 'ADMIN' ? styles.roleCardActive : {})
                  }}
                >
                  <input 
                    type="radio" 
                    name="role" 
                    value="ADMIN" 
                    checked={role === 'ADMIN'} 
                    onChange={() => setRole('ADMIN')} 
                    style={{ display: 'none' }}
                  />
                  <span style={styles.roleEmoji}>⚙️</span>
                  <span style={styles.roleTitle}>Admin</span>
                  <span style={styles.roleDesc}>Manage Store</span>
                </label>
              </div>
            </div>
          )}

          {isRegister && role === 'SHOP_OWNER' && (
            <>
              <div className="form-group">
                <label className="form-label">Select Your Restaurant*</label>
                <div style={styles.inputWrapper}>
                  <Store size={18} style={styles.inputIcon} />
                  <select 
                    className="form-input" 
                    style={{ ...styles.paddedInput, width: '100%', appearance: 'auto' }}
                    value={selectedRestaurantId} 
                    onChange={(e) => setSelectedRestaurantId(e.target.value)}
                    required
                  >
                    <option value="NEW_RESTAURANT">Register a New Restaurant...</option>
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>{r.name} — {r.address}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedRestaurantId === 'NEW_RESTAURANT' && (
                <>
                  <div className="form-group">
                    <label className="form-label">New Restaurant Name*</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Spice Garden" 
                      value={newRestName} 
                      onChange={(e) => setNewRestName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Restaurant Address*</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 789 Curry Lane, Spicetown" 
                      value={newRestAddress} 
                      onChange={(e) => setNewRestAddress(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Restaurant Description</label>
                    <textarea 
                      className="form-input" 
                      placeholder="e.g. Aromatic traditional Indian curries, tandooris..." 
                      value={newRestDesc} 
                      onChange={(e) => setNewRestDesc(e.target.value)} 
                      style={{ height: '70px', resize: 'none' }}
                    />
                  </div>
                </>
              )}
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitBtn} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm" />
                Processing...
              </>
            ) : (
              isRegister ? (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div style={styles.demoBox}>
          <p style={styles.demoTitle}>🧪 Quick Demo Access</p>
          <div style={styles.demoButtons}>
            <button 
              style={styles.demoBtn} 
              onClick={() => {
                setIsRegister(false);
                setEmail('customer@food.com');
                setPassword('customer123');
                showToast('Customer credentials loaded! Click Sign In.', 'info');
              }}
            >
              👤 Customer
            </button>
            <button 
              style={styles.demoBtn} 
              onClick={() => {
                setIsRegister(false);
                setEmail('admin@food.com');
                setPassword('admin123');
                showToast('Admin credentials loaded! Click Sign In.', 'info');
              }}
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 70px)',
    marginTop: '70px',
    padding: '2rem',
    background: 'radial-gradient(circle at 10% 20%, rgba(255, 90, 54, 0.04) 0%, rgba(0,0,0,0) 90%)',
    position: 'relative',
    overflow: 'hidden',
  },
  floatingBg: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  floatIcon: {
    position: 'absolute',
    fontSize: '2.5rem',
    opacity: 0.12,
    animation: 'float 4s ease-in-out infinite',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '2.5rem',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-lg)',
    position: 'relative',
    zIndex: 1,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  logoCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  tabs: {
    marginBottom: '1.5rem',
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    marginBottom: '0.4rem',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.88rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-light)',
  },
  paddedInput: {
    paddingLeft: '2.75rem',
  },
  roleCards: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  roleCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.85rem 0.5rem',
    borderRadius: '12px',
    border: '2px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'var(--transition)',
    textAlign: 'center',
    backgroundColor: 'var(--bg-main)',
  },
  roleCardActive: {
    borderColor: 'var(--primary)',
    backgroundColor: 'rgba(255, 90, 54, 0.05)',
    boxShadow: '0 0 0 3px rgba(255, 90, 54, 0.1)',
  },
  roleEmoji: {
    fontSize: '1.5rem',
  },
  roleTitle: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  roleDesc: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  submitBtn: {
    marginTop: '0.75rem',
    width: '100%',
    padding: '0.85rem',
  },
  errorAlert: {
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    color: 'var(--danger)',
    borderRadius: '10px',
    fontSize: '0.82rem',
    fontWeight: '500',
    marginBottom: '1.25rem',
    border: '1px solid rgba(239, 68, 68, 0.15)',
  },
  demoBox: {
    marginTop: '1.75rem',
    padding: '1rem',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-main)',
    border: '1px dashed var(--border-color)',
    textAlign: 'center',
  },
  demoTitle: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginBottom: '0.6rem',
  },
  demoButtons: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  demoBtn: {
    padding: '0.4rem 0.85rem',
    borderRadius: '8px',
    border: '1.5px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: 'var(--text-main)',
    transition: 'var(--transition)',
  }
};

export default Login;
