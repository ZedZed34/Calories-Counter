import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FlameIcon } from './Icons';
import './Layout.css';

export default function Layout({ children }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Rise entrance observer — staggers .rise elements on scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.rise').forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4 * 70, 210)}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [location.pathname]);

  return (
    <div className="shell">
      {/* Grain texture overlay */}
      <div className="grain" />

      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div className="mobile-backdrop" onClick={closeMobileMenu} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <FlameIcon size={22} />
          </div>
          <div className="brand-text">
            <h1>Calories Counter</h1>
            <span className="brand-subtitle">Fitness &amp; Nutrition</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            <span className="nav-label">Overview</span>
            {location.pathname === '/' && <span className="nav-indicator" />}
          </Link>

          <Link
            to="/workout"
            className={`nav-link ${location.pathname === '/workout' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10"/>
                <path d="M12 20V4"/>
                <path d="M6 20v-6"/>
              </svg>
            </span>
            <span className="nav-label">Workout Plan</span>
            {location.pathname === '/workout' && <span className="nav-indicator" />}
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-stat">
            <span className="stat-dot" />
            <span className="stat-text">Client-side only</span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          className="sidebar-close-btn"
          onClick={closeMobileMenu}
          aria-label="Close menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {/* Mobile header bar */}
        <div className="mobile-header">
          <button
            className="menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
          <span className="mobile-brand">Calories Counter</span>
        </div>

        {children}
      </main>
    </div>
  );
}
