import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Mail, Phone, MapPin, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <h3>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Utensils size={24} color="var(--primary)" />
              Food<span className="gradient-text">Dash</span>
            </span>
          </h3>
          <p>
            Your favorite meals delivered fresh and hot from premium local kitchens.
            Experience the best food ordering platform with lightning-fast delivery.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Browse Menu</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
            <li><Link to="/login">Login / Register</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul className="footer-links">
            <li>
              <a href="mailto:support@fooddash.com">
                <Mail size={14} /> support@fooddash.com
              </a>
            </li>
            <li>
              <a href="tel:+911234567890">
                <Phone size={14} /> +91 123 456 7890
              </a>
            </li>
            <li>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <MapPin size={14} /> Bengaluru, India
              </span>
            </li>
          </ul>
        </div>

        {/* About */}
        <div className="footer-col">
          <h4>About</h4>
          <ul className="footer-links">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">FAQ & Support</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© 2026 FoodDash. Made with ❤️ for delicious food lovers.</span>
        <div className="footer-socials">
          <a href="#" title="GitHub"><Github size={16} /></a>
          <a href="#" title="Twitter"><Twitter size={16} /></a>
          <a href="#" title="Instagram"><Instagram size={16} /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
