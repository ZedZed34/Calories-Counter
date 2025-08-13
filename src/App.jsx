import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import WorkoutPlan from './pages/WorkoutPlan';
import './app.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/workout" element={<WorkoutPlan />} />
          </Routes>
        </Layout>
      </Router>
    </UserProvider>
  );
}

export default App;
