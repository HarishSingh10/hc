import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Plus, Minus, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { SkeletonGrid } from '../components/Skeleton';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Redirect Admins and Shop Owners to their respective dashboards
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'SHOP_OWNER') {
        navigate('/owner');
      }
    }
  }, [user, navigate]);

  const handleQtyIncrease = (itemId, currentQty) => {
    updateQuantity(itemId, currentQty + 1);
  };

  const handleQtyDecrease = (itemId, currentQty) => {
    if (currentQty > 1) {
      updateQuantity(itemId, currentQty - 1);
    } else {
      removeFromCart(itemId);
    }
  };

  const categories = [
    { name: 'All', emoji: '🍽️' },
    { name: 'Veg', emoji: '🥗' },
    { name: 'Non-Veg', emoji: '🍖' },
    { name: 'Fast Food', emoji: '🍔' },
    { name: 'Chinese', emoji: '🥡' },
    { name: 'Indian', emoji: '🍛' },
  ];

  // Debounce search query input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [activeCategory, debouncedSearchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'All') {
        params.append('category', activeCategory);
      }
      if (debouncedSearchQuery.trim()) {
        params.append('search', debouncedSearchQuery.trim());
      }
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const restRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/restaurants${queryString}`);
      if (restRes.ok) {
        const restData = await restRes.json();
        setRestaurants(restData);
      }

      const menuRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/menu-items${queryString}`);
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenuItems(menuData);
      }
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants;

  const handleAddToCart = async (item) => {
    const success = await addToCart(item, 1);
    if (success) {
      showToast(`${item.name} added to your cart!`, 'success');
    }
  };

  return (
    <div style={styles.container} className="page-enter">
      {/* ── Premium Hero Banner ── */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroText}>
          <div style={styles.heroBadge}>
            <Sparkles size={14} />
            <span>Premium Food Delivery</span>
          </div>
          <h1 style={styles.heroTitle}>
            Craving <span className="gradient-text">Delicious</span> Food?
          </h1>
          <p style={styles.heroSubtitle}>
            Get your favorite meals delivered fresh and hot from premium local kitchens.
          </p>
          
          <div style={styles.searchBar}>
            <Search size={20} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search restaurants or cuisines..." 
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-input"
            />
          </div>
          
          <div style={styles.heroStats}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>{restaurants.length}+</span>
              <span style={styles.statLabel}>Restaurants</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statValue}>{menuItems.length}+</span>
              <span style={styles.statLabel}>Dishes</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statValue}>30</span>
              <span style={styles.statLabel}>Min Delivery</span>
            </div>
          </div>
        </div>
        <div style={styles.heroImgContainer}>
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80" 
            alt="Delicious food platter" 
            style={styles.heroImg}
          />
          <div style={styles.heroImgGlow} />
        </div>
      </section>

      {/* ── Categories Filter ── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Browse by Category</h2>
        <div style={styles.categoryContainer}>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              style={{
                ...styles.categoryBtn,
                ...(activeCategory === cat.name ? styles.categoryBtnActive : {})
              }}
            >
              <span style={styles.categoryEmoji}>{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── Restaurants Listing ── */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Popular Restaurants</h2>
          <span style={styles.sectionCount}>{filteredRestaurants.length} locations open</span>
        </div>
        
        {loading ? (
          <SkeletonGrid count={4} />
        ) : filteredRestaurants.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyEmoji}>🔍</span>
            <p>No restaurants match your search query.</p>
          </div>
        ) : (
          <div className="grid-cols-4" style={styles.grid}>
            {filteredRestaurants.map((restaurant, index) => (
              <div 
                key={restaurant.id} 
                className="premium-card" 
                style={{ ...styles.restaurantCard, animationDelay: `${index * 0.06}s`, animation: 'fadeInUp 0.5s ease-out both' }}
              >
                <div style={styles.cardImgContainer}>
                  <img src={restaurant.imageUrl} alt={restaurant.name} style={styles.cardImg} />
                </div>
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{restaurant.name}</h3>
                  <p style={styles.cardDescription}>{restaurant.description}</p>
                  
                  <div style={styles.cardDetails}>
                    <div style={styles.address}>
                      <MapPin size={14} color="var(--primary)" />
                      <span>{restaurant.address}</span>
                    </div>
                  </div>

                  <Link to={`/restaurant/${restaurant.id}`} className="btn btn-secondary" style={styles.viewMenuBtn}>
                    View Menu
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Featured Items Grid ── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          {activeCategory === 'All' ? '🔥 Popular Dishes' : `Featured ${activeCategory} Selection`}
        </h2>
        {loading ? (
          <SkeletonGrid count={4} />
        ) : menuItems.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyEmoji}>🍽️</span>
            <p>No dishes available under this category.</p>
          </div>
        ) : (
          <div className="grid-cols-4" style={styles.grid}>
            {menuItems.slice(0, 8).map((item, index) => (
              <div 
                key={item.id} 
                className="premium-card" 
                style={{ ...styles.menuCard, animationDelay: `${index * 0.06}s`, animation: 'fadeInUp 0.5s ease-out both' }}
              >
                <div style={styles.menuImgContainer}>
                  <img src={item.imageUrl} alt={item.name} style={styles.menuImg} />
                  <span style={{
                    ...styles.categoryBadge,
                    backgroundColor: item.category === 'Veg' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)'
                  }}>
                    {item.category}
                  </span>
                </div>
                <div style={styles.menuContent}>
                  <h3 style={styles.menuTitle}>{item.name}</h3>
                  <p style={styles.menuDesc}>{item.description}</p>
                  <p style={styles.menuRest}>From: <strong>{item.restaurant.name}</strong></p>
                  
                  <div style={styles.menuFooter}>
                    <span style={styles.price}>₹{item.price.toFixed(2)}</span>
                    {(() => {
                      const cartItem = cartItems?.find(ci => ci.menuItem.id === item.id);
                      
                      if (!user) {
                        return (
                          <Link to="/login" style={styles.addBtnOutline}>
                            + ADD
                          </Link>
                        );
                      }
                      
                      if (user.role !== 'CUSTOMER') {
                        return null;
                      }
                      
                      if (!cartItem) {
                        return (
                          <button 
                            onClick={() => handleAddToCart(item)}
                            style={styles.addBtn}
                            className="btn btn-primary"
                          >
                            + ADD
                          </button>
                        );
                      }
                      
                      return (
                        <div style={styles.qtyControl}>
                          <button 
                            onClick={() => handleQtyDecrease(item.id, cartItem.quantity)} 
                            style={styles.qtyBtn}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={styles.qtyText}>{cartItem.quantity}</span>
                          <button 
                            onClick={() => handleQtyIncrease(item.id, cartItem.quantity)} 
                            style={styles.qtyBtn}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '90px auto 2rem auto',
    padding: '0 1.5rem',
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '24px',
    padding: '3rem',
    marginBottom: '3rem',
    gap: '2rem',
    border: '1px solid var(--border-color)',
    background: 'linear-gradient(135deg, rgba(255, 90, 54, 0.06) 0%, rgba(255, 45, 85, 0.02) 50%, rgba(124, 58, 237, 0.03) 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 90, 54, 0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroText: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.35rem 0.85rem',
    borderRadius: '9999px',
    background: 'linear-gradient(135deg, rgba(255, 90, 54, 0.1), rgba(255, 45, 85, 0.1))',
    color: 'var(--primary)',
    fontSize: '0.78rem',
    fontWeight: '700',
    marginBottom: '1.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    border: '1px solid rgba(255, 90, 54, 0.15)',
  },
  heroTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '3rem',
    fontWeight: '800',
    lineHeight: '1.15',
    marginBottom: '1rem',
  },
  heroSubtitle: {
    fontSize: '1.05rem',
    color: 'var(--text-muted)',
    marginBottom: '1.75rem',
    lineHeight: '1.7',
    maxWidth: '460px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'var(--bg-card)',
    border: '2px solid var(--border-color)',
    borderRadius: '16px',
    padding: '0.85rem 1.25rem',
    boxShadow: 'var(--shadow-sm)',
    maxWidth: '500px',
    transition: 'var(--transition)',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.95rem',
    backgroundColor: 'transparent',
    color: 'var(--text-main)',
  },
  heroStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--border-color)',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '1.4rem',
    fontWeight: '800',
    fontFamily: 'var(--font-title)',
    color: 'var(--text-main)',
  },
  statLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  statDivider: {
    width: '1px',
    height: '36px',
    backgroundColor: 'var(--border-color)',
  },
  heroImgContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
  },
  heroImg: {
    width: '100%',
    maxWidth: '420px',
    height: '300px',
    objectFit: 'cover',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-lg)',
    position: 'relative',
    zIndex: 1,
  },
  heroImgGlow: {
    position: 'absolute',
    bottom: '-20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    height: '40px',
    background: 'radial-gradient(ellipse, rgba(255, 90, 54, 0.2) 0%, transparent 70%)',
    filter: 'blur(15px)',
    zIndex: 0,
  },
  section: {
    marginBottom: '3.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  sectionCount: {
    color: 'var(--text-muted)',
    fontSize: '0.92rem',
    fontWeight: '500',
    marginBottom: '1.1rem',
  },
  categoryContainer: {
    display: 'flex',
    gap: '0.75rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
  },
  categoryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.25rem',
    borderRadius: '9999px',
    border: '2px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'var(--transition)',
    whiteSpace: 'nowrap',
  },
  categoryBtnActive: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: 'white',
    borderColor: 'transparent',
    boxShadow: '0 4px 15px rgba(255, 90, 54, 0.3)',
    transform: 'translateY(-1px)',
  },
  categoryEmoji: {
    fontSize: '1.1rem',
  },
  grid: {
    margin: '0',
  },
  restaurantCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  cardImgContainer: {
    height: '170px',
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  cardContent: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  cardDescription: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '1rem',
    flex: 1,
  },
  cardDetails: {
    marginBottom: '1rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '0.75rem',
  },
  address: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  viewMenuBtn: {
    width: '100%',
    padding: '0.5rem 1rem',
    fontSize: '0.88rem',
  },
  menuCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  menuImgContainer: {
    height: '160px',
    position: 'relative',
    overflow: 'hidden',
  },
  menuImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  categoryBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    color: 'white',
    fontSize: '0.68rem',
    fontWeight: '700',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    backdropFilter: 'blur(4px)',
  },
  menuContent: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  menuTitle: {
    fontSize: '1.02rem',
    fontWeight: '700',
    marginBottom: '0.4rem',
  },
  menuDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '0.5rem',
    flex: 1,
  },
  menuRest: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginBottom: '0.75rem',
  },
  menuFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '0.75rem',
    marginTop: 'auto',
  },
  price: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  addBtn: {
    padding: '0.4rem 0.85rem',
    fontSize: '0.82rem',
  },
  addBtnOutline: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: 'var(--primary)',
    padding: '0.35rem 0.65rem',
    borderRadius: '6px',
    border: '1.5px solid var(--primary)',
    transition: 'var(--transition)',
  },
  qtyControl: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid var(--border-color)',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-main)',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    color: 'var(--text-main)',
    transition: 'var(--transition)',
  },
  qtyText: {
    fontSize: '0.82rem',
    fontWeight: '700',
    width: '20px',
    textAlign: 'center',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 2rem',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px dashed var(--border-color)',
  },
  emptyEmoji: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '0.75rem',
  },
};

export default Home;
