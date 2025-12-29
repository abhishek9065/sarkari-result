import { useState } from 'react';

interface SearchFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    locations?: string[];
    qualifications?: string[];
}

export interface FilterState {
    location: string;
    qualification: string;
    minAge: string;
    maxAge: string;
    sortBy: 'latest' | 'deadline' | 'posts';
}

const DEFAULT_LOCATIONS = [
    'All India',
    'Delhi',
    'Mumbai',
    'Kolkata',
    'Chennai',
    'Bangalore',
    'Hyderabad',
    'Lucknow',
    'Patna',
    'Jaipur',
];

const DEFAULT_QUALIFICATIONS = [
    'Any',
    '10th Pass',
    '12th Pass',
    'Graduate',
    'Post Graduate',
    'Diploma',
    'ITI',
    'B.Tech/B.E',
    'MBBS',
    'LLB',
];

export function SearchFilters({ onFilterChange, locations = DEFAULT_LOCATIONS, qualifications = DEFAULT_QUALIFICATIONS }: SearchFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        location: '',
        qualification: '',
        minAge: '',
        maxAge: '',
        sortBy: 'latest',
    });
    const [showFilters, setShowFilters] = useState(false);

    const updateFilter = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const defaultFilters: FilterState = {
            location: '',
            qualification: '',
            minAge: '',
            maxAge: '',
            sortBy: 'latest',
        };
        setFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const hasActiveFilters = filters.location || filters.qualification || filters.minAge || filters.maxAge;

    return (
        <div className="search-filters">
            <button
                className={`filter-toggle ${showFilters ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
            >
                🔍 Filters {hasActiveFilters && <span className="filter-count">●</span>}
            </button>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>📍 Location</label>
                            <select
                                value={filters.location}
                                onChange={(e) => updateFilter('location', e.target.value)}
                            >
                                <option value="">All Locations</option>
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>🎓 Qualification</label>
                            <select
                                value={filters.qualification}
                                onChange={(e) => updateFilter('qualification', e.target.value)}
                            >
                                <option value="">Any Qualification</option>
                                {qualifications.map(q => (
                                    <option key={q} value={q}>{q}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="filter-group age-filter">
                            <label>👤 Age Range</label>
                            <div className="age-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minAge}
                                    onChange={(e) => updateFilter('minAge', e.target.value)}
                                    min="18"
                                    max="65"
                                />
                                <span>to</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxAge}
                                    onChange={(e) => updateFilter('maxAge', e.target.value)}
                                    min="18"
                                    max="65"
                                />
                            </div>
                        </div>

                        <div className="filter-group">
                            <label>📊 Sort By</label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
                            >
                                <option value="latest">Latest First</option>
                                <option value="deadline">Deadline Soon</option>
                                <option value="posts">Most Vacancies</option>
                            </select>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button className="clear-filters" onClick={clearFilters}>
                            ✕ Clear All Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchFilters;
