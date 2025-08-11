import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Public Pages
import HomePage from '../pages/HomePage';
// import AboutPage from '../pages/AboutPage'; // File does not exist
const AboutPage = () => <div>About Page (Placeholder)</div>;
// import ContactPage from '../pages/ContactPage'; // File does not exist
const ContactPage = () => <div>Contact Page (Placeholder)</div>;

// Auth Pages
import LoginPage from '../features/auth/LoginPage';
import SignupPage from '../features/auth/SignupPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import Dashboard from '../pages/Dashboard';
import ExploreState from '../pages/ExploreState';
import CreateNewTrip from '../pages/CreateNewTrip';
import CreateStop from '../pages/CreateStop';
import TripForm from '../pages/UpdateNewTrip';
import CreateActivity from '../pages/CreateActivity';

// Protected Pages
import TripList from '../pages/TripList';
import ViewTrip from '../pages/ViewTrip';
// import CreateTripPage from '../features/trips/CreateTripPage'; // File does not exist
const CreateTripPage = () => <div>Create Trip Page (Placeholder)</div>;
// import ItineraryBuilderPage from '../features/trips/ItineraryBuilderPage'; // File does not exist
const ItineraryBuilderPage = () => <div>Itinerary Builder Page (Placeholder)</div>;
// import PublicTripViewPage from '../features/trips/PublicTripViewPage'; // File does not exist
const PublicTripViewPage = () => <div>Public Trip View Page (Placeholder)</div>;
import ProfilePage from '../features/profile/ProfilePage';
import SeachCity from '../pages/SeachCity';
// import DashboardPage from '../features/admin/DashboardPage'; // File does not exist
const DashboardPage = () => <div>Dashboard Page (Placeholder)</div>;

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/public/:publicId" element={<PublicTripViewPage />} />

      {/* Auth Routes (redirect if authenticated) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips"
        element={
          <ProtectedRoute>
            <TripList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/new"
        element={
          <ProtectedRoute>
            <CreateNewTrip />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:id"
        element={
          <ProtectedRoute>
            <ViewTrip />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:id/edit"
        element={
          <ProtectedRoute>
            <ItineraryBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* <Route
        path="/india/:state"
        element={
          <ProtectedRoute>
            <ExploreState />
          </ProtectedRoute>
        }
      /> */}

      <Route
        path="/india/:state"
        element={
          <ProtectedRoute>
            <SeachCity />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding/newtrip"
        element={
          <ProtectedRoute>
            <CreateNewTrip />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding/newstop"
        element={
          <ProtectedRoute>
            <CreateStop />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding/newactivity"
        element={
          <ProtectedRoute>
            <CreateActivity />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;