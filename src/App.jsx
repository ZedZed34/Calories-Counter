import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Overview from './pages/Overview';
import WorkoutPlan from './pages/WorkoutPlan';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import FoodLog from './pages/FoodLog';
import Progress from './pages/Progress';
import './app.css';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public routes — calculator + workout work without login */}
              <Route path="/" element={<Overview />} />
              <Route path="/workout" element={<WorkoutPlan />} />
              <Route path="/auth" element={<Auth />} />

              {/* Protected routes — require authentication */}
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/log" element={
                <ProtectedRoute><FoodLog /></ProtectedRoute>
              } />
              <Route path="/progress" element={
                <ProtectedRoute><Progress /></ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </Router>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
