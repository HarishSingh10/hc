import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, ShoppingCart, ArrowLeft, Store, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'ADMIN';

  return (
    <aside style={styles.sidebar} className="glass">
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Utensils size={20} />
        </div>
        <div>
          <span style={styles.title}>{isAdmin ? 'Admin Panel' : 'Owner Panel'}</span>
          <span style={styles.subtitle}>{isAdmin ? 'Management Hub' : 'Partner Hub'}</span>
        </div>
      </div>
      
      <nav style={styles.nav}>
        <span style={styles.navSection}>MAIN MENU</span>

        {isAdmin ? (
          <>
            <NavLink 
              to="/admin" 
              end
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.activeLink : {})
              })}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink 
              to="/admin/restaurants" 
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.activeLink : {})
              })}
            >
              <Store size={20} />
              <span>Restaurants</span>
            </NavLink>

            <NavLink 
              to="/admin/menus" 
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.activeLink : {})
              })}
            >
              <FileText size={20} />
              <span>Menu Items</span>
            </NavLink>

            <NavLink 
              to="/admin/orders" 
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.activeLink : {})
              })}
            >
              <ShoppingCart size={20} />
              <span>Orders</span>
            </NavLink>
          </>
        ) : (
          <NavLink 
            to="/owner" 
            end
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.activeLink : {})
            })}
          >
            <FileText size={20} />
            <span>Manage Menu</span>
          </NavLink>
        )}
      </nav>

      <div style={styles.footer}>
        <NavLink to="/" style={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Shop
        </NavLink>
        <div style={styles.versionBadge}>v2.0</div>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    position: 'fixed',
    top: '70px',
    left: 0,
    bottom: 0,
    width: '260px',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    zIndex: 900,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid var(--border-color)',
  },
  headerIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    display: 'block',
    fontFamily: 'var(--font-title)',
    fontWeight: '800',
    fontSize: '1.1rem',
    letterSpacing: '0.3px',
    color: 'var(--text-main)',
  },
  subtitle: {
    display: 'block',
    fontSize: '0.72rem',
    color: 'var(--text-light)',
    fontWeight: '500',
    marginTop: '1px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    flex: 1,
  },
  navSection: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: 'var(--text-light)',
    letterSpacing: '1px',
    marginBottom: '0.5rem',
    marginTop: '0.5rem',
    paddingLeft: '0.5rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-muted)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  activeLink: {
    color: 'white',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    boxShadow: '0 4px 15px rgba(255, 90, 54, 0.3)',
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.88rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    transition: 'var(--transition)',
  },
  versionBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: 'var(--border-color)',
    color: 'var(--text-light)',
  }
};

export default Sidebar;
