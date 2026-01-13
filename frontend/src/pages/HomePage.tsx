import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Navigation, Footer, Marquee, FeaturedGrid, SectionTable, SkeletonLoader, SocialButtons, SearchFilters, LegacyRedirect } from '../components';
import type { FilterState } from '../components/ui/SearchFilters';
import { useAuth } from '../context/AuthContext';
import { SECTIONS, PATHS, type TabType, type PageType } from '../utils';

export function HomePage() {
    const [data, setData] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    // activeTab removed as it is now handled by routing
    const [showSearch, setShowSearch] = useState(false);
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Filter state
    const [filters, setFilters] = useState<FilterState>({
        keyword: '',
        type: '',
        location: '',
        qualification: '',
        minAge: '',
        maxAge: '',
        sortBy: 'latest',
    });

    // Fetch announcements using shared helper
    useEffect(() => {
        fetchAnnouncements()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Apply filters and sorting
    const filteredAndSortedData = useMemo(() => {
        let result = [...data];

        // Filter by type
        if (filters.type) {
            result = result.filter(item => item.type === filters.type);
        }

        // Filter by keyword
        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(keyword) ||
                item.organization.toLowerCase().includes(keyword) ||
                (item.description && item.description.toLowerCase().includes(keyword))
            );
        }

        // Filter by location (if location field exists)
        if (filters.location && filters.location !== 'All India') {
            result = result.filter(item => {
                // Check in description or if we have a location field
                const itemText = `${item.title} ${item.description || ''}`.toLowerCase();
                return itemText.includes(filters.location.toLowerCase());
            });
        }

        // Filter by qualification (if applicable)
        if (filters.qualification && filters.qualification !== 'Any') {
            result = result.filter(item => {
                const itemText = `${item.title} ${item.description || ''}`.toLowerCase();
                return itemText.includes(filters.qualification.toLowerCase());
            });
        }

        // Sort the results
        switch (filters.sortBy) {
            case 'latest':
                result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case 'deadline':
                result.sort((a, b) => {
                    const deadlineA = a.last_date ? new Date(a.last_date).getTime() : Infinity;
                    const deadlineB = b.last_date ? new Date(b.last_date).getTime() : Infinity;
                    return deadlineA - deadlineB;
                });
                break;
            case 'posts':
                result.sort((a, b) => (b.vacancy_count || 0) - (a.vacancy_count || 0));
                break;
            case 'title':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        return result;
    }, [data, filters]);

    // Get filtered data by type for section display
    const getByType = (type: ContentType) => filteredAndSortedData.filter(item => item.type === type);

    // Handle item click - navigate to SEO-friendly URL
    const handleItemClick = (item: Announcement) => {
        navigate(`/${item.type}/${item.slug}`);
    };

    // Navigate to category
    const handleCategoryClick = (type: ContentType) => {
        const path = PATHS[type] || '/';
        navigate(path);
    };

    // Handle filter change
    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
    };

    // Determine if a type filter is active (to show only that section)
    const showAllSections = !filters.type;

    return (
        <div className="app">
            <LegacyRedirect />
            <Header
                setCurrentPage={(page) => page === 'admin' ? navigate('/admin') : navigate('/' + page)}
                user={user}
                isAuthenticated={isAuthenticated}
                onLogin={() => setShowAuthModal(true)}
                onLogout={logout}
                onProfileClick={() => { }}
            />
            <Navigation
                activeTab={undefined} // Home page has no active type tab usually, or could set based on URL if we wanted to support query params for back-compat
                setShowSearch={setShowSearch}
                setCurrentPage={(page) => navigate('/' + page)}
                isAuthenticated={isAuthenticated}
                onShowAuth={() => setShowAuthModal(true)}
            />
            <Marquee />

            <main className="main-content">
                <FeaturedGrid onItemClick={handleCategoryClick} />

                {/* Advanced Search Filters */}
                <div className="search-section" style={{ padding: '0 16px', marginBottom: '16px' }}>
                    <SearchFilters
                        onFilterChange={handleFilterChange}
                        showTypeFilter={true}
                    />
                </div>

                <SocialButtons />

                {loading ? (
                    <SkeletonLoader />
                ) : (
                    <div className="home-sections">
                        {/* Show results count when filtering */}
                        {(filters.keyword || filters.type || filters.location || filters.qualification) && (
                            <div className="filter-results-info" style={{
                                padding: '12px 16px',
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                borderRadius: '12px',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#166534'
                            }}>
                                <span>📊</span>
                                Found <strong>{filteredAndSortedData.length}</strong> results
                                {filters.keyword && <span>for "{filters.keyword}"</span>}
                            </div>
                        )}

                        <div className="sections-grid">
                            {showAllSections ? (
                                // Show all sections when no type filter
                                SECTIONS.map(section => {
                                    const items = getByType(section.type);
                                    if (items.length === 0 && (filters.keyword || filters.location || filters.qualification)) {
                                        return null; // Hide empty sections when filtering
                                    }
                                    return (
                                        <SectionTable
                                            key={section.type}
                                            title={section.title}
                                            items={items}
                                            onItemClick={handleItemClick}
                                            onViewMore={() => handleCategoryClick(section.type)}
                                        />
                                    );
                                })
                            ) : (
                                // Show only the filtered type section
                                <SectionTable
                                    key={filters.type}
                                    title={SECTIONS.find(s => s.type === filters.type)?.title || 'Results'}
                                    items={filteredAndSortedData}
                                    onItemClick={handleItemClick}
                                    onViewMore={() => handleCategoryClick(filters.type as ContentType)}
                                />
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer setCurrentPage={(page) => navigate('/' + page)} />
        </div>
    );
}

