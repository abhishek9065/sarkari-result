import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SectionTable, SkeletonLoader } from '../components';
import { SearchFilters, TagsCloud, SubscribeBox, NotificationPrompt } from '../components';
import { API_BASE } from '../utils';
import type { Announcement, ContentType } from '../types';

// Cache utilities
const CACHE_KEY = 'sarkari_home_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getFromCache(): { data: Announcement[], timestamp: number } | null {
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch { return null; }
}

function saveToCache(data: Announcement[]) {
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch { /* ignore quota errors */ }
}

export function HomePage() {
    const [data, setData] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Derived state from URL params
    const searchQuery = searchParams.get('search') || '';
    const searchType = (searchParams.get('type') as ContentType) || '';
    const searchCategory = searchParams.get('category') || '';
    const searchOrganization = searchParams.get('organization') || '';
    const searchQualification = searchParams.get('qualification') || '';
    const sortOrder = (searchParams.get('sort') as 'newest' | 'oldest' | 'deadline') || 'newest';

    const appliedFiltersCount = [searchType, searchCategory, searchOrganization, searchQualification].filter(Boolean).length;

    // Stale-While-Revalidate Pattern
    useEffect(() => {
        const isHomeRequest = !searchQuery && !searchType && !searchCategory && !searchOrganization && !searchQualification && sortOrder === 'newest';

        // Check sessionStorage cache for home requests
        if (isHomeRequest) {
            const cached = getFromCache();
            if (cached) {
                setData(cached.data);
                setLoading(false);

                // If cache is fresh (< TTL), don't refetch
                if (Date.now() - cached.timestamp < CACHE_TTL) {
                    return;
                }
                // Otherwise, revalidate in background (stale-while-revalidate)
            }
        }

        const controller = new AbortController();
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (searchType) params.set('type', searchType);
        if (searchCategory) params.set('category', searchCategory);
        if (searchOrganization) params.set('organization', searchOrganization);
        if (searchQualification) params.set('qualification', searchQualification);
        params.set('sort', sortOrder);

        // Only show loading if no cached data
        if (data.length === 0) setLoading(true);
        setError(null);

        fetch(`${API_BASE}/api/announcements?${params.toString()}`, { signal: controller.signal })
            .then(async (res) => {
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                const body = (await res.json()) as { data: Announcement[] };
                const fetchedData = body.data ?? [];
                setData(fetchedData);

                // Save to sessionStorage for home requests
                if (isHomeRequest) {
                    saveToCache(fetchedData);
                }
            })
            .catch((err) => {
                if (err.name === 'AbortError') return;
                setError(err.message);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [searchQuery, searchType, searchCategory, searchOrganization, searchQualification, sortOrder]);

    const handleFilterChange = (filters: any) => {
        setSearchParams(prev => {
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'newest') prev.set(key, String(value));
                else prev.delete(key);
            });
            // Preserve search query if it exists separately
            if (searchQuery) prev.set('search', searchQuery);
            return prev;
        });
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    const handleItemClick = (item: Announcement) => {
        navigate(`/${item.type}/${item.slug}`);
    };

    // Filter data for sections (only for main home view without search)
    const isFiltered = searchQuery || searchType || searchCategory || searchOrganization || searchQualification;
    const latestJobs = data.filter(item => item.type === 'job').slice(0, 6);
    const outcomes = data.filter(item => ['result', 'answer-key', 'admit-card'].includes(item.type)).slice(0, 6);

    return (
        <main className="main-content">
            <NotificationPrompt />

            <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px' }}>
                <div className="main-column">
                    <SearchFilters
                        onFilterChange={handleFilterChange}
                    />

                    {loading ? (
                        <SkeletonLoader />
                    ) : error ? (
                        <div className="error-message">⚠️ {error}</div>
                    ) : isFiltered ? (
                        <SectionTable
                            title={`Search Results (${data.length})`}
                            items={data}
                            onItemClick={handleItemClick}
                            fullWidth
                        />
                    ) : (
                        <>
                            <SectionTable
                                title="🔥 Latest Jobs"
                                items={latestJobs}
                                onItemClick={handleItemClick}
                                onViewMore={() => navigate('/jobs')}
                            />
                            <SectionTable
                                title="📋 Results & Cards"
                                items={outcomes}
                                onItemClick={handleItemClick}
                                onViewMore={() => navigate('/results')}
                            />
                        </>
                    )}
                </div>

                <aside className="sidebar">
                    <SubscribeBox />
                    <TagsCloud />

                    <div className="ad-placeholder sticky">
                        <div className="ad-label">Advertisement</div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
