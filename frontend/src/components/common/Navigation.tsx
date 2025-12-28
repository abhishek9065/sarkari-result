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
    return (
        <nav className="main-nav">
            <div className="nav-container">
                {NAV_ITEMS.map((item) => {
                    if (item.type === 'bookmarks' && !isAuthenticated) return null;
                    return (
                        <button
                            key={item.label}
                            className={`nav-link ${activeTab === item.type && (item.type || !activeTab) ? 'active' : (!activeTab && !item.type ? 'active' : '')}`}
                            onClick={() => {
                                if (item.type === 'bookmarks' && !isAuthenticated) {
                                    onShowAuth();
                                    return;
                                }
                                setActiveTab(item.type);
                                setCurrentPage('home');
                                if (!item.type) goBack();
                            }}
                        >
                            {item.label}
                        </button>
                    );
                })}
                <span className="nav-search" onClick={() => setShowSearch(true)}>🔍</span>
                <button className="nav-link admin-link" onClick={() => setCurrentPage('admin')}>⚙️ Admin</button>
            </div>
        </nav>
    );
}
