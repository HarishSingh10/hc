import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Plus, Minus, ShoppingBag, Star, Send, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { user, token } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchRestaurantData();
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/restaurants/${id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error("Error fetching reviews:", e);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setSubmittingReview(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/restaurants/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: ratingInput, comment: commentInput })
      });
      if (res.ok) {
        setCommentInput('');
        setRatingInput(5);
        setHoverRating(0);
        fetchReviews();
        showToast('Review submitted successfully! Thanks for your feedback.', 'success');
      } else {
        const err = await res.text();
        showToast('Failed to submit review: ' + err, 'error');
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast('Network error submitting review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchRestaurantData = async () => {
    setLoading(true);
    try {
      const restRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/restaurants/${id}`);
      if (restRes.ok) {
        const restData = await restRes.json();
        setRestaurant(restData);
      }

      const menuRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/menu-items/restaurant/${id}`);
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setAllMenuItems(menuData);
      }
    } catch (error) {
      console.error("Error fetching restaurant profile:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddToCart = async (item, qty = 1) => {
    const success = await addToCart(item, qty);
    if (success) {
      showToast(`Added ${item.name} to cart!`, 'success');
    }
  };

  /* ── Review Statistics ── */
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length
  }));

  const getAvatarColor = (name) => {
    const colors = ['#ff5a36', '#3b82f6', '#10b981', '#f59e0b', '#7c3aed', '#ec4899', '#14b8a6'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const formatReviewDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  /* ── Render Star Icons ── */
  const renderStars = (rating, size = 16) => (
    <div className="star-rating-display">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={`star ${i <= rating ? 'filled' : ''}`}
          fill={i <= rating ? '#fbbf24' : 'none'}
          stroke={i <= rating ? '#fbbf24' : 'var(--border-color)'}
        />
      ))}
    </div>
  );

  if (loading && !restaurant) {
    return (
      <div style={styles.loading}>
        <span className="spinner" />
        <span>Loading restaurant details...</span>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={styles.errorContainer}>
        <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>😕</span>
        <h2>Restaurant not found!</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Browse
        </Link>
      </div>
    );
  }

  const uniqueCategories = ['All', ...new Set(allMenuItems.map(item => item.category))];
  const displayedItems = activeCategory === 'All'
    ? allMenuItems
    : allMenuItems.filter(item => item.category === activeCategory);

  return (
    <div style={styles.container} className="page-enter">
      {/* Back Button */}
      <Link to="/" style={styles.backBtn}>
        <ArrowLeft size={16} />
        <span>Back to Restaurants</span>
      </Link>

      {/* Restaurant Header */}
      <div style={styles.hero} className="glass">
        <div style={styles.heroContent}>
          <h1 style={styles.name}>{restaurant.name}</h1>
          <p style={styles.desc}>{restaurant.description}</p>
          <div style={styles.heroMeta}>
            <div style={styles.addressRow}>
              <MapPin size={16} color="var(--primary)" />
              <span>{restaurant.address}</span>
            </div>
            {reviews.length > 0 && (
              <div style={styles.ratingRow}>
                {renderStars(Math.round(parseFloat(averageRating)))}
                <span style={styles.ratingValue}>{averageRating}</span>
                <span style={styles.reviewCount}>({reviews.length} reviews)</span>
              </div>
            )}
          </div>
        </div>
        <div style={styles.heroImgWrapper}>
          <img src={restaurant.imageUrl} alt={restaurant.name} style={styles.heroImg} />
        </div>
      </div>

      {/* Categories + Menu Grid */}
      <div style={styles.menuContainer}>
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Menu Section</h3>
          <ul style={styles.categoryList}>
            {uniqueCategories.map(cat => (
              <li key={cat}>
                <button
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    ...styles.categoryLink,
                    ...(activeCategory === cat ? styles.categoryLinkActive : {})
                  }}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.menuList}>
          <h2 style={styles.listTitle}>
            {activeCategory === 'All' ? 'All Dishes' : `${activeCategory} Selection`}
          </h2>
          
          {loading ? (
            <div style={styles.loadingMenu}>
              <span className="spinner spinner-sm" style={{ marginRight: '0.5rem' }} />
              Filtering menu...
            </div>
          ) : displayedItems.length === 0 ? (
            <div style={styles.emptyMenu}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🍽️</span>
              No items available matching this category.
            </div>
          ) : (
            <div style={styles.menuGrid}>
              {displayedItems.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="premium-card" 
                  style={{ ...styles.itemCard, animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both` }}
                >
                  <div style={styles.itemImgWrapper} className="itemImgWrapper">
                    <img src={item.imageUrl} alt={item.name} style={styles.itemImg} />
                    {!item.available && (
                      <span style={styles.unavailableOverlay}>Out of Stock</span>
                    )}
                    <span style={{
                      ...styles.categoryBadge,
                      backgroundColor: item.category === 'Veg' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)'
                    }}>
                      {item.category}
                    </span>
                  </div>
                  <div style={styles.itemDetails}>
                    <h3 style={styles.itemName}>{item.name}</h3>
                    <p style={styles.itemDesc}>{item.description}</p>
                    
                    <div style={styles.itemFooter}>
                      <span style={styles.itemPrice}>₹{item.price.toFixed(2)}</span>
                      
                      {item.available && (
                        <div style={styles.cartActions}>
                          {(() => {
                            const cartItem = cartItems.find(ci => ci.menuItem.id === item.id);
                            
                            if (!user) {
                              return (
                                <Link to="/login" style={styles.addCartBtn} className="btn btn-primary">
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
                                  onClick={() => handleAddToCart(item, 1)}
                                  className="btn btn-primary"
                                  style={styles.addCartBtn}
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
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
         Reviews & Feedback Section
         ═══════════════════════════════════════════════════ */}
      <section style={styles.reviewSection}>
        <h2 style={styles.reviewSectionTitle}>
          <MessageSquare size={24} />
          Reviews & Feedback
        </h2>

        <div style={styles.reviewLayout}>
          {/* Left: Summary */}
          <div style={styles.reviewSummary} className="premium-card-static">
            <div style={styles.summaryInner}>
              <div style={styles.avgRating}>
                <span style={styles.avgNumber}>{averageRating}</span>
                <span style={styles.avgOutOf}>/ 5</span>
              </div>
              {renderStars(Math.round(parseFloat(averageRating)), 22)}
              <p style={styles.totalReviews}>{reviews.length} total reviews</p>

              {/* Rating Breakdown */}
              <div className="rating-breakdown" style={{ marginTop: '1.5rem' }}>
                {ratingCounts.map(({ star, count }) => (
                  <div className="rating-bar-row" key={star}>
                    <span className="rating-bar-label">{star}★</span>
                    <div className="rating-bar-track">
                      <div 
                        className="rating-bar-fill" 
                        style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }} 
                      />
                    </div>
                    <span className="rating-bar-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Review List + Write Form */}
          <div style={styles.reviewListSection}>
            {/* Write a Review */}
            {user && user.role === 'CUSTOMER' && (
              <div style={styles.writeReview} className="premium-card-static">
                <h3 style={styles.writeTitle}>
                  <Star size={18} color="var(--primary)" />
                  Write a Review
                </h3>
                <form onSubmit={handleSubmitReview} style={styles.reviewForm}>
                  <div style={styles.starPicker}>
                    <span style={styles.starPickerLabel}>Your Rating:</span>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          size={28}
                          className={`star ${i <= (hoverRating || ratingInput) ? 'filled' : ''}`}
                          fill={i <= (hoverRating || ratingInput) ? '#fbbf24' : 'none'}
                          stroke={i <= (hoverRating || ratingInput) ? '#fbbf24' : 'var(--border-color)'}
                          onMouseEnter={() => setHoverRating(i)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRatingInput(i)}
                          style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                        />
                      ))}
                    </div>
                  </div>
                  <textarea
                    className="form-input"
                    placeholder="Share your experience... What did you love about this restaurant?"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    required
                    style={{ height: '90px', resize: 'none' }}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={styles.submitReviewBtn}
                    disabled={submittingReview || !commentInput.trim()}
                  >
                    {submittingReview ? (
                      <>
                        <span className="spinner spinner-sm" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Review
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {!user && (
              <div style={styles.loginPrompt} className="premium-card-static">
                <p>💬 <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign in</Link> to write a review and share your experience!</p>
              </div>
            )}

            {/* Review Cards */}
            <div style={styles.reviewCards}>
              {reviews.length === 0 ? (
                <div style={styles.noReviews} className="premium-card-static">
                  <MessageSquare size={36} color="var(--text-light)" />
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem' }}>No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                reviews.map((review, idx) => (
                  <div 
                    key={review.id || idx} 
                    className="review-card"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    <div style={styles.reviewHeader}>
                      <div 
                        className="review-avatar" 
                        style={{ backgroundColor: getAvatarColor(review.user?.name) }}
                      >
                        {review.user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div style={styles.reviewMeta}>
                        <span style={styles.reviewName}>{review.user?.name || 'Anonymous'}</span>
                        <span style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</span>
                      </div>
                      <div style={styles.reviewStars}>
                        {renderStars(review.rating, 14)}
                      </div>
                    </div>
                    <p style={styles.reviewComment}>{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
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
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-muted)',
    fontSize: '0.88rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    transition: 'var(--transition)',
  },
  hero: {
    display: 'flex',
    borderRadius: '24px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    padding: '2.5rem',
    gap: '2rem',
    marginBottom: '3rem',
    background: 'linear-gradient(135deg, rgba(255, 90, 54, 0.04) 0%, rgba(255, 45, 85, 0.01) 100%)',
  },
  heroContent: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  name: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '0.75rem',
  },
  desc: {
    color: 'var(--text-muted)',
    lineHeight: '1.7',
    marginBottom: '1.25rem',
    fontSize: '1rem',
  },
  heroMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  addressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  ratingValue: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  reviewCount: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  heroImgWrapper: {
    flex: 1.2,
  },
  heroImg: {
    width: '100%',
    height: '240px',
    objectFit: 'cover',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-md)',
  },
  menuContainer: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: '2.5rem',
  },
  sidebar: {
    position: 'sticky',
    top: '100px',
    height: 'fit-content',
  },
  sidebarTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    marginBottom: '1.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--text-main)',
  },
  categoryList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  categoryLink: {
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: '0.7rem 1rem',
    borderRadius: '10px',
    fontSize: '0.92rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  categoryLinkActive: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: 'white',
    boxShadow: '0 4px 12px rgba(255, 90, 54, 0.2)',
  },
  menuList: {
    flex: 1,
  },
  listTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
  },
  menuGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  itemCard: {
    display: 'flex',
    height: '160px',
  },
  itemImgWrapper: {
    width: '200px',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  itemImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  unavailableOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.88rem',
  },
  categoryBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    color: 'white',
    fontSize: '0.62rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    backdropFilter: 'blur(4px)',
  },
  itemDetails: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: '1.15rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  itemDesc: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '0.5rem',
  },
  itemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  cartActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
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
    width: '32px',
    height: '32px',
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
  addCartBtn: {
    padding: '0.45rem 0.85rem',
    fontSize: '0.82rem',
  },
  loginBtn: {
    fontSize: '0.78rem',
    color: 'var(--primary)',
    fontWeight: '600',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    border: '1.5px solid var(--primary)',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    height: '60vh',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  loadingMenu: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    color: 'var(--text-muted)',
    padding: '3rem 0',
  },
  emptyMenu: {
    textAlign: 'center',
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    padding: '3rem 0',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px dashed var(--border-color)',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '5rem 2rem',
  },

  /* ── Reviews Section ── */
  reviewSection: {
    marginTop: '4rem',
    paddingTop: '3rem',
    borderTop: '2px solid var(--border-color)',
  },
  reviewSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '2rem',
  },
  reviewLayout: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '2rem',
  },
  reviewSummary: {
    position: 'sticky',
    top: '100px',
    height: 'fit-content',
    padding: '1.75rem',
    borderRadius: '16px',
  },
  summaryInner: {
    textAlign: 'center',
  },
  avgRating: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '4px',
    marginBottom: '0.5rem',
  },
  avgNumber: {
    fontSize: '3rem',
    fontWeight: '800',
    fontFamily: 'var(--font-title)',
    lineHeight: 1,
    color: 'var(--text-main)',
  },
  avgOutOf: {
    fontSize: '1.2rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  totalReviews: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '0.5rem',
  },
  reviewListSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  writeReview: {
    padding: '1.5rem',
    borderRadius: '16px',
  },
  writeTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '1.25rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--border-color)',
  },
  reviewForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  starPicker: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  starPickerLabel: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  submitReviewBtn: {
    alignSelf: 'flex-end',
    padding: '0.6rem 1.25rem',
    fontSize: '0.88rem',
  },
  loginPrompt: {
    padding: '1.25rem',
    borderRadius: '12px',
    textAlign: 'center',
    fontSize: '0.92rem',
    color: 'var(--text-muted)',
  },
  reviewCards: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
  },
  noReviews: {
    padding: '3rem 2rem',
    textAlign: 'center',
    borderRadius: '16px',
  },
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  reviewMeta: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  reviewName: {
    fontSize: '0.92rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  reviewDate: {
    fontSize: '0.75rem',
    color: 'var(--text-light)',
  },
  reviewStars: {
    flexShrink: 0,
  },
  reviewComment: {
    fontSize: '0.88rem',
    lineHeight: '1.6',
    color: 'var(--text-muted)',
    paddingLeft: '52px',
  },
};

export default RestaurantDetail;
