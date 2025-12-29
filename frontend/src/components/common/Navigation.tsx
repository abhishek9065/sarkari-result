import { useState } from 'react';
import { NAV_ITEMS, type PageType, type TabType } from '../../utils/constants';

interface NavProps {
    activeTab: TabType;
    setActiveTab: (type: TabType) => void;
    setShowSearch: (show: boolean) => void;
    goBack: () => void;
    setCurrentPage: (page: PageType) => void;
    isAuthenticated: boolean;
    onShowAuth: () => void;
}

export function Navigation({ activeTab, setActiveTab, setShowSearch, goBack, setCurrentPage, isAuthenticated, onShowAuth }: NavProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
        if (item.type === 'bookmarks' && !isAuthenticated) {
            onShowAuth();
            return;
        }
        setActiveTab(item.type);
        if (!item.type) goBack();
        setMobileMenuOpen(false); // Close menu after selection
    };

    return (
        <nav className="main-nav">
            {/* Hamburger Menu Button - Only visible on mobile */}
            <button
                className="hamburger-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
            >
                <span className={`hamburger-icon ${mobileMenuOpen ? 'open' : ''}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </button>

            {/* Navigation Container */}
            <div className={`nav-container ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                {NAV_ITEMS.map((item) => {
                    if (item.type === 'bookmarks' && !isAuthenticated) return null;
                    return (
                        <button
                            key={item.label}
                            className={`nav-link ${activeTab === item.type && (item.type || !activeTab) ? 'active' : (!activeTab && !item.type ? 'active' : '')}`}
                            onClick={() => handleNavClick(item)}
                        >
                            {item.label}
                        </button>
                    );
                })}
                <span className="nav-search" onClick={() => { setShowSearch(true); setMobileMenuOpen(false); }}>🔍</span>
                <button className="nav-link admin-link" onClick={() => { setCurrentPage('admin'); setMobileMenuOpen(false); }}>⚙️ Admin</button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
            )}
        </nav>
    );
}
