import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Colors from './pages/Colors';
import PaintYourWall from './pages/PaintYourWall';
import Projects from './pages/Projects';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes without layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes with layout */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/colors" element={<Layout><Colors /></Layout>} />
          
          {/* Protected routes */}
          <Route 
            path="/paint-your-wall" 
            element={
              <Layout>
                <ProtectedRoute>
                  <PaintYourWall />
                </ProtectedRoute>
              </Layout>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <Layout>
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              </Layout>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
