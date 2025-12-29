import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header, Navigation, Footer, Marquee, ScrollToTop, SocialButtons } from '../components';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/modals/AuthModal';

export function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [activeTab, setActiveTab] = useState<any>(undefined);

    // Helper to handle navigation
    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <div className="app-container">
            <Header
                setCurrentPage={(page) => page === 'admin' ? handleNavigation('/admin') : handleNavigation('/' + page)}
                user={user}
                isAuthenticated={isAuthenticated}
                onLogin={() => setShowAuthModal(true)}
                onLogout={logout}
                onProfileClick={() => handleNavigation('/profile')}
            />

            <Navigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setShowSearch={setShowSearch}
                goBack={() => navigate(-1)}
                setCurrentPage={(page) => handleNavigation('/' + page)}
                isAuthenticated={isAuthenticated}
                onShowAuth={() => setShowAuthModal(true)}
            />

            <Marquee />

            <main className="main-content">
                <Outlet />
            </main>

            <Footer setCurrentPage={(page) => handleNavigation('/' + page)} />

            <SocialButtons />
            <ScrollToTop />

            {showAuthModal && (
                <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} />
            )}
        </div>
    );
}

export default MainLayout;
