import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="shell">
      <aside>
        <h1>Calories Counter</h1>
        <nav>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Overview
          </Link>
          <Link to="/workout" className={location.pathname === '/workout' ? 'active' : ''}>
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
