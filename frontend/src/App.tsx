import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LoadingSpinner } from './components';
import { PWAInstallPrompt } from './components/ui/PWAInstallPrompt';
import MainLayout from './layouts/MainLayout';
import './styles.css';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const DetailPage = lazy(() => import('./pages/DetailPage').then(module => ({ default: module.DetailPage })));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then(module => ({ default: module.CategoryPage })));
const StaticPage = lazy(() => import('./pages/StaticPage').then(module => ({ default: module.StaticPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(module => ({ default: module.AdminPage })));
const UserProfile = lazy(() => import('./components/ui/UserProfile').then(module => ({ default: module.UserProfile }))); // Using component as page for now

// Placeholder for protected route wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // Simple check - in real app useAuth hook
  const token = localStorage.getItem('token');
  // allow access for now or redirect
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app-wrapper">
          <PWAInstallPrompt />
          <Suspense fallback={<div className="suspense-loader"><LoadingSpinner /></div>}>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />

                {/* Category Routes */}
                <Route path="jobs" element={<CategoryPage type="job" />} />
                <Route path="results" element={<CategoryPage type="result" />} />
                <Route path="admit-card" element={<CategoryPage type="admit-card" />} />
                <Route path="answer-key" element={<CategoryPage type="answer-key" />} />
                <Route path="admission" element={<CategoryPage type="admission" />} />
                <Route path="syllabus" element={<CategoryPage type="syllabus" />} />

                {/* Detail Routes */}
                <Route path=":type/:slug" element={<DetailPage />} />

                {/* Static Pages */}
                <Route path="about" element={<StaticPage />} />
                <Route path="contact" element={<StaticPage />} />
                <Route path="privacy" element={<StaticPage />} />
                <Route path="terms" element={<StaticPage />} />
                <Route path="disclaimer" element={<StaticPage />} />

                {/* User & Admin */}
                <Route path="profile" element={<UserProfile bookmarks={[]} onItemClick={() => { }} user={{ email: 'demo' }} logout={() => { }} />} />
                {/* Note: UserProfile needs props or context refactor to work as standalone page cleanly. 
                    For now, it's better to keep it as a component shown in modal or handle slightly differently.
                    However, per instructions, we are routing everything. 
                    I will update UserProfile to useAuth context internally instead of props to be a true page. */}

                <Route path="admin" element={<AdminPage />} />

                {/* catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
