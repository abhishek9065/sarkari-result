import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header, Navigation, Footer, Marquee, FeaturedGrid, SectionTable, SkeletonLoader, SocialButtons } from '../components';
import { useAuth } from '../context/AuthContext';
import { API_BASE, SECTIONS, type TabType, type PageType } from '../utils';
import type { Announcement, ContentType } from '../types';

export function HomePage() {
    const [data, setData] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>(undefined);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Fetch announcements
    useEffect(() => {
        fetch(`${API_BASE}/api/announcements`)
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Filter by type
    const getByType = (type: ContentType) => data.filter(item => item.type === type);

    // Handle item click - navigate to SEO-friendly URL
    const handleItemClick = (item: Announcement) => {
        navigate(`/${item.type}/${item.slug}`);
    };

    // Navigate to category
    const handleCategoryClick = (type: ContentType) => {
        const paths: Record<ContentType, string> = {
            'job': '/jobs',
            'result': '/results',
            'admit-card': '/admit-card',
            'answer-key': '/answer-key',
            'admission': '/admission',
            'syllabus': '/syllabus'
        };
        navigate(paths[type]);
    };

    // Filter data by active tab
    const filteredData = activeTab && activeTab !== 'bookmarks' && activeTab !== 'profile'
        ? data.filter(item => item.type === activeTab)
        : data;

    // Search filter
    const searchedData = searchQuery
        ? filteredData.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.organization.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : filteredData;

    return (
        <div className="app">
            <Header
                setCurrentPage={(page) => page === 'admin' ? navigate('/admin') : navigate('/' + page)}
                user={user}
                isAuthenticated={isAuthenticated}
                onLogin={() => setShowAuthModal(true)}
                onLogout={logout}
                onProfileClick={() => { }}
            />
            <Navigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setShowSearch={setShowSearch}
                goBack={() => { }}
                setCurrentPage={(page) => navigate('/' + page)}
                isAuthenticated={isAuthenticated}
                onShowAuth={() => setShowAuthModal(true)}
            />
            <Marquee />

            <main className="main-content">
                <FeaturedGrid onItemClick={handleCategoryClick} />
                <SocialButtons />

                {loading ? (
                    <SkeletonLoader />
                ) : (
                    <div className="home-sections">
                        <div className="sections-grid">
                            {SECTIONS.map(section => (
                                <SectionTable
                                    key={section.type}
                                    title={section.title}
                                    items={getByType(section.type)}
                                    onItemClick={handleItemClick}
                                    onViewMore={() => handleCategoryClick(section.type)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <Footer setCurrentPage={(page) => navigate('/' + page)} />
        </div>
    );
}
