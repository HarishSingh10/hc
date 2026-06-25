import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut, Shield, ClipboardList, Utensils, Sun, Moon, Menu, X, Store } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={styles.header} className="glass">
      <div style={styles.navContainer}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <Utensils size={28} color="var(--primary)" />
          <span style={styles.logoText}>Food<span className="gradient-text">Dash</span></span>
        </Link>

        {/* Desktop Links */}
        <nav style={styles.navLinks}>
          <Link to="/" style={{ ...styles.navLink, ...(isActive('/') ? styles.navLinkActive : {}) }}>
            Browse Menu
            {isActive('/') && <span style={styles.activeIndicator} />}
          </Link>
          
          {user && user.role === 'CUSTOMER' && (
            <Link to="/orders" style={{ ...styles.navLink, ...(isActive('/orders') ? styles.navLinkActive : {}) }}>
              <ClipboardList size={18} />
              My Orders
              {isActive('/orders') && <span style={styles.activeIndicator} />}
            </Link>
          )}

          {user && user.role === 'ADMIN' && (
            <Link to="/admin" style={styles.adminLink}>
              <Shield size={18} />
              Admin Panel
            </Link>
          )}

          {user && user.role === 'SHOP_OWNER' && (
            <Link to="/owner" style={styles.adminLink}>
              <Store size={18} />
              Shop Owner Panel
            </Link>
          )}
        </nav>

        {/* Action buttons */}
        <div style={styles.actions}>
          {/* Dark Mode Toggle */}
          <button 
            className="theme-toggle" 
            onClick={() => setDarkMode(!darkMode)} 
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user && user.role === 'CUSTOMER' && (
            <Link to="/cart" style={styles.cartButton}>
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span style={styles.cartBadge} key={cartCount}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div style={styles.userSection}>
              <div style={styles.userInfo}>
                <div style={styles.userAvatar}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={styles.userName}>{user.name}</span>
                <span style={styles.userRoleBadge}>{user.role.toLowerCase()}</span>
              </div>
              <button onClick={handleLogout} style={styles.logoutButton} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={styles.loginBtn}>
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button 
            style={styles.hamburger} 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={styles.mobileDrawer}>
          <Link to="/" style={styles.mobileLink}>Browse Menu</Link>
          {user && user.role === 'CUSTOMER' && (
            <>
              <Link to="/orders" style={styles.mobileLink}>My Orders</Link>
              <Link to="/cart" style={styles.mobileLink}>
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
            </>
          )}
          {user && user.role === 'ADMIN' && (
            <Link to="/admin" style={styles.mobileLink}>Admin Panel</Link>
          )}
          {user && user.role === 'SHOP_OWNER' && (
            <Link to="/owner" style={styles.mobileLink}>Shop Owner Panel</Link>
          )}
          {user ? (
            <button onClick={handleLogout} style={styles.mobileLinkBtn}>Logout</button>
          ) : (
            <Link to="/login" style={styles.mobileLink}>Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
};

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: '70px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 2rem',
    borderBottom: '1px solid var(--border-color)',
  },
  navContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.5rem',
    fontWeight: '800',
    fontFamily: 'var(--font-title)',
    color: 'var(--text-main)',
  },
  logoText: {
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontWeight: '500',
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    transition: 'var(--transition)',
    position: 'relative',
    paddingBottom: '2px',
  },
  navLinkActive: {
    color: 'var(--primary)',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '20px',
    height: '3px',
    borderRadius: '2px',
    background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
  },
  adminLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontWeight: '600',
    fontSize: '0.95rem',
    color: 'var(--secondary)',
    transition: 'var(--transition)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  cartButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-main)',
    border: '2px solid var(--border-color)',
    color: 'var(--text-main)',
    transition: 'var(--transition)',
  },
  cartBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: 'white',
    fontSize: '0.7rem',
    fontWeight: '700',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(255, 90, 54, 0.4)',
    animation: 'bounceIn 0.4s ease-out',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.35rem 0.75rem 0.35rem 0.35rem',
    borderRadius: '24px',
    backgroundColor: 'var(--bg-main)',
    border: '1px solid var(--border-color)',
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  userName: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  userRoleBadge: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    fontWeight: '700',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    backgroundColor: 'var(--border-color)',
    color: 'var(--text-muted)',
    letterSpacing: '0.3px',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: '2px solid var(--border-color)',
    color: 'var(--danger)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  loginBtn: {
    padding: '0.5rem 1.25rem',
    fontSize: '0.9rem',
  },
  hamburger: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  mobileDrawer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    padding: '1rem 0',
    borderTop: '1px solid var(--border-color)',
    animation: 'fadeInUp 0.3s ease-out',
  },
  mobileLink: {
    display: 'block',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
    color: 'var(--text-main)',
    transition: 'var(--transition)',
  },
  mobileLinkBtn: {
    display: 'block',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
    color: 'var(--danger)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  }
};

export default Navbar;
