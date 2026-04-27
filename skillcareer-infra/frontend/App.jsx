import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import CareerPage from './pages/CareerPage';
import SkillAnalysisPage from './pages/SkillAnalysisPage';
import RoadmapPage from './pages/RoadmapPage';
import LMSPage from './pages/LMSPage';
import AssignmentPage from './pages/AssignmentPage';
import ProgressPage from './pages/ProgressPage';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen text-slate-900">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              <Route path="/career" element={<PrivateRoute><CareerPage /></PrivateRoute>} />
              <Route path="/skill-analysis" element={<PrivateRoute><SkillAnalysisPage /></PrivateRoute>} />
              <Route path="/roadmap" element={<PrivateRoute><RoadmapPage /></PrivateRoute>} />
              <Route path="/lms" element={<PrivateRoute><LMSPage /></PrivateRoute>} />
              <Route path="/assignment" element={<PrivateRoute><AssignmentPage /></PrivateRoute>} />
              <Route path="/progress" element={<PrivateRoute><ProgressPage /></PrivateRoute>} />
              <Route path="/*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
