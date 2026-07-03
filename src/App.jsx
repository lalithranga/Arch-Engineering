import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Spinner } from './components/ui/Card.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import AllProjects from './pages/AllProjects.jsx';
import AboutDetail from './pages/AboutDetail.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import Contact from './pages/Contact.jsx';

/**
 * App.jsx
 * ----------------------------------------------------------------------
 * Top-level route table. The whole tree is wrapped in <AuthProvider> so
 * any page can call useAuth(). <ProtectedRoute> is the CLIENT-SIDE gate
 * for /admin — it makes the dashboard simply unreachable in the UI for
 * anyone without a session, redirecting to /login and remembering where
 * they were headed so Login.jsx can send them back after signing in.
 *
 * IMPORTANT: this is a UX convenience, not the real security boundary.
 * The actual boundary is Supabase Row Level Security — see the README
 * at the end of this blueprint. Even if someone bypassed this router
 * entirely and called the Supabase client directly from devtools, RLS
 * policies on each table/bucket would still block any write they're
 * not authorized to make.
 * ----------------------------------------------------------------------
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<AllProjects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/about/:slug" element={<AboutDetail />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Catch-all: send unknown paths back to the homepage. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While we're still checking for an existing session (e.g. on page
  // refresh), show a spinner instead of flashing the login page and
  // then immediately redirecting again once the session resolves.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Checking session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // `state={{ from: location }}` lets Login.jsx redirect back to
    // wherever the visitor was originally trying to go.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
