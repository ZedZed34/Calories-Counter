import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

export default function Layout({ children }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="shell">
      <aside className={isMobileMenuOpen ? 'mobile-menu-open' : ''}>
        <div className="header-section">
          <h1>Calories Counter</h1>
          <button 
            className="menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
        <nav className={`nav ${isMobileMenuOpen ? 'nav-open' : ''}`}>
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
            onClick={closeMobileMenu}
          >
            Overview
          </Link>
          <Link 
            to="/workout" 
            className={location.pathname === '/workout' ? 'active' : ''}
            onClick={closeMobileMenu}
          >
            Workout Plan
          </Link>
        </nav>
      </aside>

      <main>
        {children}
      </main>
    </div>
  );
}
