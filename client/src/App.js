import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Web3Context } from './contexts/Web3Context';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CreateCourse from './pages/CreateCourse';
import CourseDetails from './pages/CourseDetails';
import Certificates from './pages/Certificates';

// Protected Route component
const ProtectedRoute = ({ children, userType }) => {
  const { account, isTeacher, loading } = useContext(Web3Context);

  if (loading) {
    return <div className="container mt-5 text-center">Loading...</div>;
  }

  if (!account) {
    return <Navigate to="/login" />;
  }

  // For teacher routes, check if user is a teacher
  if (userType === 'teacher' && !isTeacher) {
    return <Navigate to="/student" />;
  }

  // For student routes, check if user is a student
  if (userType === 'student' && isTeacher) {
    return <Navigate to="/teacher" />;
  }

  return children;
};

const App = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Teacher Routes */}
          <Route 
            path="/teacher" 
            element={
              <ProtectedRoute userType="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-course" 
            element={
              <ProtectedRoute userType="teacher">
                <CreateCourse />
              </ProtectedRoute>
            } 
          />
          
          {/* Student Routes */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute userType="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/course/:id" 
            element={
              <ProtectedRoute userType="student">
                <CourseDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/certificates" 
            element={
              <ProtectedRoute userType="student">
                <Certificates />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App; 