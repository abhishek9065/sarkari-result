import { useEffect, useState } from 'react';
import './styles.css';
import type { Announcement, ContentType } from './types';

const apiBase = import.meta.env.VITE_API_BASE ?? '';

// Page types
type PageType = 'home' | 'admin' | 'about' | 'contact' | 'privacy' | 'disclaimer';

// Navigation menu items
const navItems = [
  { label: 'Home', type: undefined as ContentType | undefined },
  { label: 'Result', type: 'result' as ContentType },
  { label: 'Jobs', type: 'job' as ContentType },
  { label: 'Admit Card', type: 'admit-card' as ContentType },
  { label: 'Admission', type: 'admission' as ContentType },
  { label: 'Syllabus', type: 'syllabus' as ContentType },
  { label: 'Answer Key', type: 'answer-key' as ContentType },
];

// Featured exams
const featuredItems = [
  { title: 'SSC GD 2025', subtitle: 'Apply Now', color: 'purple', type: 'job' as ContentType },
  { title: 'Railway RRB', subtitle: 'Result Out', color: 'blue', type: 'result' as ContentType },
  { title: 'UPSC CSE 2024', subtitle: 'Notification', color: 'red', type: 'job' as ContentType },
  { title: 'Bank PO/Clerk', subtitle: 'Admit Card', color: 'orange', type: 'admit-card' as ContentType },
  { title: 'State PSC', subtitle: 'Latest Jobs', color: 'green', type: 'job' as ContentType },
];

// Content sections
const sections = [
  { title: 'Latest Jobs', type: 'job' as ContentType },
  { title: 'Latest Result', type: 'result' as ContentType },
  { title: 'Admit Card', type: 'admit-card' as ContentType },
  { title: 'Answer Key', type: 'answer-key' as ContentType },
  { title: 'Admission', type: 'admission' as ContentType },
  { title: 'Syllabus', type: 'syllabus' as ContentType },
];

function App() {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ContentType | undefined>();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Announcement | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Advanced search states
  const [searchCategory, setSearchCategory] = useState('');
  const [searchType, setSearchType] = useState<ContentType | ''>('');

  // Fetch announcements
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (searchType) params.set('type', searchType);
    if (searchCategory) params.set('category', searchCategory);

    setLoading(true);
    setError(null);

    fetch(`${apiBase}/api/announcements?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const body = (await res.json()) as { data: Announcement[] };
        setData(body.data ?? []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [searchQuery, searchType, searchCategory]);

  // Filter by type
  const getByType = (type: ContentType) => data.filter((item) => item.type === type);

  // Format date
  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Handle item click
  const handleItemClick = (item: Announcement) => {
    setSelectedItem(item);
    setCurrentPage('home');
  };

  // Go back to home
  const goBack = () => {
    setSelectedItem(null);
    setActiveTab(undefined);
    setCurrentPage('home');
  };

  // Refresh data
  const refreshData = () => {
    setSearchQuery(searchQuery + ' ');
    setTimeout(() => setSearchQuery(searchQuery.trim()), 100);
  };

  // Render admin panel
  if (currentPage === 'admin') {
    return (
      <div className="app">
        <Header setCurrentPage={setCurrentPage} />
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowSearch={setShowSearch}
          goBack={goBack}
          setCurrentPage={setCurrentPage}
        />
        <AdminPanel
          isLoggedIn={isAdminLoggedIn}
          setIsLoggedIn={setIsAdminLoggedIn}
          announcements={data}
          refreshData={refreshData}
          goBack={goBack}
        />
        <Footer setCurrentPage={setCurrentPage} />
      </div>
    );
  }

  // Render other pages
  if (currentPage === 'about' || currentPage === 'contact' || currentPage === 'privacy' || currentPage === 'disclaimer') {
    return (
      <div className="app">
        <Header setCurrentPage={setCurrentPage} />
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowSearch={setShowSearch}
          goBack={goBack}
          setCurrentPage={setCurrentPage}
        />
        <StaticPage type={currentPage} goBack={goBack} />
        <Footer setCurrentPage={setCurrentPage} />
      </div>
    );
  }

  // Render detail page
  if (selectedItem) {
    return (
      <div className="app">
        <Header setCurrentPage={setCurrentPage} />
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowSearch={setShowSearch}
          goBack={goBack}
          setCurrentPage={setCurrentPage}
        />

        <div className="page-with-sidebar">
          <div className="detail-page">
            <button className="back-btn" onClick={goBack}>← Back to Home</button>

            <h1 className="detail-title">{selectedItem.title}</h1>

            <div className="detail-meta">
              <span className="meta-badge">📅 Posted: {formatDate(selectedItem.postedAt)}</span>
              {selectedItem.deadline && <span className="meta-badge">⏳ Last Date: {formatDate(selectedItem.deadline)}</span>}
              <span className="meta-badge">📍 {selectedItem.location || 'All India'}</span>
            </div>

            {/* Important Dates */}
            <table className="detail-table">
              <thead>
                <tr><th colSpan={2}>📅 Important Dates</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Notification Date</strong></td><td>{formatDate(selectedItem.postedAt)}</td></tr>
                <tr><td><strong>Application Start</strong></td><td>{formatDate(selectedItem.postedAt)}</td></tr>
                {selectedItem.deadline && (
                  <tr><td><strong>Last Date to Apply</strong></td><td style={{ color: '#cc0000', fontWeight: 600 }}>{formatDate(selectedItem.deadline)}</td></tr>
                )}
              </tbody>
            </table>

            {/* Application Fee */}
            {selectedItem.applicationFee && (
              <table className="detail-table">
                <thead>
                  <tr><th colSpan={2}>💰 Application Fee</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>General / OBC</strong></td><td>{selectedItem.applicationFee}</td></tr>
                  <tr><td><strong>SC / ST / PH</strong></td><td>Exempted / Reduced</td></tr>
                </tbody>
              </table>
            )}

            {/* Vacancy Details */}
            {selectedItem.totalPosts && (
              <table className="detail-table">
                <thead>
                  <tr><th colSpan={2}>👥 Vacancy Details</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Total Posts</strong></td><td style={{ color: '#27AE60', fontWeight: 700, fontSize: '1.1rem' }}>{selectedItem.totalPosts.toLocaleString()}</td></tr>
                  {selectedItem.minQualification && (<tr><td><strong>Qualification</strong></td><td>{selectedItem.minQualification}</td></tr>)}
                  {selectedItem.ageLimit && (<tr><td><strong>Age Limit</strong></td><td>{selectedItem.ageLimit}</td></tr>)}
                </tbody>
              </table>
            )}

            {/* Important Links */}
            <table className="links-table">
              <thead>
                <tr><th colSpan={2}>🔗 Important Links</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Apply Online</strong></td>
                  <td><a href={selectedItem.externalLink || '#'} target="_blank" rel="noreferrer" className="apply-btn">Click Here to Apply</a></td>
                </tr>
                <tr><td><strong>Official Notification</strong></td><td><a href={selectedItem.externalLink || '#'} target="_blank" rel="noreferrer">Download PDF</a></td></tr>
                <tr><td><strong>Official Website</strong></td><td><a href={selectedItem.externalLink || '#'} target="_blank" rel="noreferrer">{selectedItem.organization}</a></td></tr>
              </tbody>
            </table>
          </div>

          <aside className="sidebar">
            <SectionTable title="Latest Jobs" items={getByType('job').slice(0, 5)} onItemClick={handleItemClick} />
            <SectionTable title="Latest Result" items={getByType('result').slice(0, 5)} onItemClick={handleItemClick} />
          </aside>
        </div>

        <Footer setCurrentPage={setCurrentPage} />
      </div>
    );
  }

  // Render homepage
  return (
    <div className="app">
      <Header setCurrentPage={setCurrentPage} />
      <Navigation
        activeTab={activeTab}
        setActiveTab={(type) => { setActiveTab(type); setSelectedItem(null); }}
        setShowSearch={setShowSearch}
        goBack={goBack}
        setCurrentPage={setCurrentPage}
      />

      <Marquee />
      <SocialButtons />

      {/* Search Modal */}
      {showSearch && (
        <div className="search-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>🔍 Search Announcements</h3>
            <input
              type="text"
              placeholder="Search jobs, results, admit cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="search-filters">
              <select value={searchType} onChange={(e) => setSearchType(e.target.value as ContentType | '')}>
                <option value="">All Types</option>
                <option value="job">Jobs</option>
                <option value="result">Results</option>
                <option value="admit-card">Admit Card</option>
                <option value="answer-key">Answer Key</option>
                <option value="admission">Admission</option>
                <option value="syllabus">Syllabus</option>
              </select>
              <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                <option value="">All Categories</option>
                <option value="Central Government">Central Government</option>
                <option value="State Government">State Government</option>
                <option value="Banking">Banking</option>
                <option value="Railways">Railways</option>
                <option value="Defence">Defence</option>
                <option value="PSU">PSU</option>
                <option value="University">University</option>
              </select>
            </div>
            <button className="search-submit-btn" onClick={() => setShowSearch(false)}>Search</button>
          </div>
        </div>
      )}

      {/* Featured Boxes */}
      <section className="featured-section">
        <div className="featured-grid">
          {featuredItems.map((item, idx) => (
            <div key={idx} className={`featured-box ${item.color}`} onClick={() => setActiveTab(item.type)}>
              <div className="featured-title">{item.title}</div>
              <div className="featured-subtitle">{item.subtitle}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Loading latest updates...</div>}

        {!loading && !error && (
          <>
            {activeTab ? (
              <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
                <SectionTable
                  title={navItems.find((n) => n.type === activeTab)?.label || 'Results'}
                  items={getByType(activeTab)}
                  onItemClick={handleItemClick}
                  fullWidth
                />
              </div>
            ) : (
              <>
                <div className="content-grid">
                  {sections.slice(0, 3).map((section) => (
                    <SectionTable
                      key={section.type}
                      title={section.title}
                      items={getByType(section.type)}
                      onViewMore={() => setActiveTab(section.type)}
                      onItemClick={handleItemClick}
                    />
                  ))}
                </div>
                <div className="content-grid">
                  {sections.slice(3, 6).map((section) => (
                    <SectionTable
                      key={section.type}
                      title={section.title}
                      items={getByType(section.type)}
                      onViewMore={() => setActiveTab(section.type)}
                      onItemClick={handleItemClick}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

// ============ COMPONENTS ============

interface HeaderProps {
  setCurrentPage: (page: PageType) => void;
}

function Header({ setCurrentPage }: HeaderProps) {
  return (
    <header className="site-header">
      <h1 className="site-title" onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer' }}>
        SARKARI RESULT
      </h1>
      <p className="site-subtitle">SarkariResult.com</p>
    </header>
  );
}

interface NavProps {
  activeTab: ContentType | undefined;
  setActiveTab: (type: ContentType | undefined) => void;
  setShowSearch: (show: boolean) => void;
  goBack: () => void;
  setCurrentPage: (page: PageType) => void;
}

function Navigation({ activeTab, setActiveTab, setShowSearch, goBack, setCurrentPage }: NavProps) {
  return (
    <nav className="main-nav">
      <div className="nav-container">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`nav-link ${activeTab === item.type && (item.type || !activeTab) ? 'active' : (!activeTab && !item.type ? 'active' : '')}`}
            onClick={() => {
              setActiveTab(item.type);
              setCurrentPage('home');
              if (!item.type) goBack();
            }}
          >
            {item.label}
          </button>
        ))}
        <span className="nav-search" onClick={() => setShowSearch(true)}>🔍</span>
        <button className="nav-link admin-link" onClick={() => setCurrentPage('admin')}>⚙️ Admin</button>
      </div>
    </nav>
  );
}

function Marquee() {
  return (
    <div className="marquee-container">
      <span className="live-badge">🔴 LIVE</span>
      <div className="marquee-track">
        <div className="marquee-content">
          <span className="marquee-item">✨ Welcome to Sarkari Result - Your #1 Source for Government Jobs!</span>
          <span className="marquee-item">🔥 SSC GD Constable 2025 Notification Released - Apply Now</span>
          <span className="marquee-item">📢 UPSC CSE 2024 Final Result Declared - Check Result</span>
          <span className="marquee-item">⚡ Railway RRB NTPC Result 2024 - Download Scorecard</span>
          <span className="marquee-item">🎯 Bank PO/Clerk Admit Cards Available - Download Now</span>
        </div>
      </div>
    </div>
  );
}

function SocialButtons() {
  return (
    <div className="social-buttons">
      <a href="#" className="social-btn whatsapp-btn">📱 Join WhatsApp Channel</a>
      <a href="#" className="social-btn telegram-btn">✈️ Join Telegram Channel</a>
    </div>
  );
}

interface SectionTableProps {
  title: string;
  items: Announcement[];
  onViewMore?: () => void;
  onItemClick: (item: Announcement) => void;
  fullWidth?: boolean;
}

function SectionTable({ title, items, onViewMore, onItemClick, fullWidth }: SectionTableProps) {
  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="section-table" style={fullWidth ? { gridColumn: '1 / -1' } : undefined}>
      <div className="section-table-header">{title}</div>
      <div className="section-table-content">
        <ul>
          {items.length > 0 ? (
            items.slice(0, 10).map((item) => (
              <li key={item.id}>
                <a href="#" onClick={(e) => { e.preventDefault(); onItemClick(item); }}>
                  {item.title}
                  {item.totalPosts && ` [${item.totalPosts} Post]`}
                  {item.deadline && ` - Last: ${formatDate(item.deadline)}`}
                </a>
              </li>
            ))
          ) : (
            <li>No {title.toLowerCase()} available at the moment.</li>
          )}
        </ul>
      </div>
      {onViewMore && (
        <div className="section-table-footer">
          <button className="view-more-btn" onClick={onViewMore}>View More</button>
        </div>
      )}
    </div>
  );
}

// ============ ADMIN PANEL ============

interface AdminPanelProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  announcements: Announcement[];
  refreshData: () => void;
  goBack: () => void;
}

function AdminPanel({ isLoggedIn, setIsLoggedIn, announcements, refreshData, goBack }: AdminPanelProps) {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [activeAdminTab, setActiveAdminTab] = useState<'list' | 'add'>('list');
  const [formData, setFormData] = useState({
    title: '',
    type: 'job' as ContentType,
    category: 'Central Government',
    organization: '',
    externalLink: '',
    location: 'All India',
    deadline: '',
    totalPosts: '',
    minQualification: '',
    ageLimit: '',
    applicationFee: '',
  });
  const [message, setMessage] = useState('');

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo login - in production, use actual API
    if (loginForm.email === 'admin@sarkari.com' && loginForm.password === 'admin123') {
      setIsLoggedIn(true);
      setMessage('Login successful!');
    } else {
      setMessage('Invalid credentials. Use admin@sarkari.com / admin123');
    }
  };

  // Handle form submit (create announcement)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Creating announcement...');

    // In production, this would call the API
    try {
      const response = await fetch(`${apiBase}/api/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalPosts: formData.totalPosts ? parseInt(formData.totalPosts) : undefined,
        }),
      });

      if (response.ok) {
        setMessage('Announcement created successfully!');
        setFormData({
          title: '', type: 'job', category: 'Central Government', organization: '',
          externalLink: '', location: 'All India', deadline: '', totalPosts: '',
          minQualification: '', ageLimit: '', applicationFee: '',
        });
        refreshData();
      } else {
        setMessage('Failed to create. Note: Admin API requires authentication.');
      }
    } catch (err) {
      setMessage('Error creating announcement. Using mock data mode.');
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="main-content">
        <div className="admin-container">
          <div className="admin-login-box">
            <h2>🔐 Admin Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="admin@sarkari.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              {message && <p className="form-message">{message}</p>}
              <button type="submit" className="admin-btn primary">Login</button>
              <button type="button" className="admin-btn secondary" onClick={goBack}>Back to Home</button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="admin-container">
        <div className="admin-header">
          <h2>⚙️ Admin Dashboard</h2>
          <div className="admin-tabs">
            <button className={activeAdminTab === 'list' ? 'active' : ''} onClick={() => setActiveAdminTab('list')}>
              📋 All Announcements
            </button>
            <button className={activeAdminTab === 'add' ? 'active' : ''} onClick={() => setActiveAdminTab('add')}>
              ➕ Add New
            </button>
          </div>
          <button className="admin-btn logout" onClick={() => setIsLoggedIn(false)}>Logout</button>
        </div>

        {message && <p className="form-message">{message}</p>}

        {activeAdminTab === 'list' ? (
          <div className="admin-list">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Organization</th>
                  <th>Posts</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.slice(0, 20).map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.title.substring(0, 40)}...</td>
                    <td><span className={`type-badge ${item.type}`}>{item.type}</span></td>
                    <td>{item.organization}</td>
                    <td>{item.totalPosts || '-'}</td>
                    <td>
                      <button className="action-btn edit">Edit</button>
                      <button className="action-btn delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-form-container">
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. SSC CGL 2025 Recruitment"
                    required
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label>Type *</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentType })}>
                    <option value="job">Job</option>
                    <option value="result">Result</option>
                    <option value="admit-card">Admit Card</option>
                    <option value="answer-key">Answer Key</option>
                    <option value="admission">Admission</option>
                    <option value="syllabus">Syllabus</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    <option value="Central Government">Central Government</option>
                    <option value="State Government">State Government</option>
                    <option value="Banking">Banking</option>
                    <option value="Railways">Railways</option>
                    <option value="Defence">Defence</option>
                    <option value="PSU">PSU</option>
                    <option value="University">University</option>
                  </select>
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label>Organization *</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Staff Selection Commission"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. All India"
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label>Total Posts</label>
                  <input
                    type="number"
                    value={formData.totalPosts}
                    onChange={(e) => setFormData({ ...formData, totalPosts: e.target.value })}
                    placeholder="e.g. 5000"
                  />
                </div>
                <div className="form-group">
                  <label>Last Date</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label>Qualification</label>
                  <input
                    type="text"
                    value={formData.minQualification}
                    onChange={(e) => setFormData({ ...formData, minQualification: e.target.value })}
                    placeholder="e.g. Graduate"
                  />
                </div>
                <div className="form-group">
                  <label>Age Limit</label>
                  <input
                    type="text"
                    value={formData.ageLimit}
                    onChange={(e) => setFormData({ ...formData, ageLimit: e.target.value })}
                    placeholder="e.g. 18-27 years"
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label>Application Fee</label>
                  <input
                    type="text"
                    value={formData.applicationFee}
                    onChange={(e) => setFormData({ ...formData, applicationFee: e.target.value })}
                    placeholder="e.g. ₹100"
                  />
                </div>
                <div className="form-group">
                  <label>External Link</label>
                  <input
                    type="url"
                    value={formData.externalLink}
                    onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="admin-btn primary">Create Announcement</button>
                <button type="button" className="admin-btn secondary" onClick={() => setActiveAdminTab('list')}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

// ============ STATIC PAGES ============

interface StaticPageProps {
  type: 'about' | 'contact' | 'privacy' | 'disclaimer';
  goBack: () => void;
}

function StaticPage({ type, goBack }: StaticPageProps) {
  const pages = {
    about: {
      title: 'About Us',
      content: `
        <h3>Welcome to Sarkari Result</h3>
        <p>Sarkari Result is India's leading platform for government job notifications, exam results, admit cards, and application forms.</p>
        
        <h4>Our Mission</h4>
        <p>To provide accurate, timely, and comprehensive information about government employment opportunities to millions of job seekers across India.</p>
        
        <h4>What We Offer</h4>
        <ul>
          <li>Latest Government Job Notifications</li>
          <li>Exam Results & Answer Keys</li>
          <li>Admit Card Downloads</li>
          <li>Admission Updates</li>
          <li>Syllabus & Exam Patterns</li>
        </ul>
        
        <h4>Why Choose Us</h4>
        <ul>
          <li>✅ 100% Verified Information</li>
          <li>✅ Real-time Updates</li>
          <li>✅ User-friendly Interface</li>
          <li>✅ No Registration Required</li>
          <li>✅ Free to Use</li>
        </ul>
      `
    },
    contact: {
      title: 'Contact Us',
      content: `
        <h3>Get in Touch</h3>
        <p>We'd love to hear from you! For any queries, suggestions, or feedback, please reach out to us.</p>
        
        <div class="contact-info">
          <p><strong>📧 Email:</strong> contact@sarkariresult.com</p>
          <p><strong>📱 WhatsApp:</strong> +91-XXXXXXXXXX</p>
          <p><strong>📍 Address:</strong> New Delhi, India</p>
        </div>
        
        <h4>Follow Us</h4>
        <p>
          <a href="#">Telegram</a> | 
          <a href="#">WhatsApp</a> | 
          <a href="#">Facebook</a> | 
          <a href="#">Twitter</a>
        </p>
        
        <h4>Feedback Form</h4>
        <p>For detailed queries or job posting requests, please email us with your complete details.</p>
      `
    },
    privacy: {
      title: 'Privacy Policy',
      content: `
        <h3>Privacy Policy</h3>
        <p><strong>Last Updated:</strong> December 2024</p>
        
        <h4>Information We Collect</h4>
        <p>We may collect the following types of information:</p>
        <ul>
          <li>Browser type and version</li>
          <li>Pages visited and time spent</li>
          <li>Referring website</li>
          <li>IP address (anonymized)</li>
        </ul>
        
        <h4>How We Use Information</h4>
        <ul>
          <li>Improve website functionality</li>
          <li>Analyze traffic patterns</li>
          <li>Provide relevant content</li>
        </ul>
        
        <h4>Cookies</h4>
        <p>We use cookies to enhance user experience. You can disable cookies in your browser settings.</p>
        
        <h4>Third-party Services</h4>
        <p>We may use third-party services like Google Analytics and advertising networks.</p>
        
        <h4>Contact</h4>
        <p>For privacy concerns, email us at privacy@sarkariresult.com</p>
      `
    },
    disclaimer: {
      title: 'Disclaimer',
      content: `
        <h3>Disclaimer</h3>
        
        <h4>Information Accuracy</h4>
        <p>While we strive to provide accurate and up-to-date information, we make no warranties about the completeness, reliability, or accuracy of the information on this website.</p>
        
        <h4>Official Sources</h4>
        <p>All information is collected from official government websites and notifications. Users are advised to verify information from official sources before taking any action.</p>
        
        <h4>External Links</h4>
        <p>This website contains links to external websites. We are not responsible for the content or privacy practices of these sites.</p>
        
        <h4>No Guarantee</h4>
        <p>We do not guarantee any job offers, results, or admission. The final authority rests with the respective recruiting organizations.</p>
        
        <h4>Liability</h4>
        <p>We shall not be held liable for any loss or damage arising from the use of information on this website.</p>
        
        <h4>Updates</h4>
        <p>This disclaimer may be updated from time to time. Please check regularly for updates.</p>
      `
    }
  };

  const page = pages[type];

  return (
    <main className="main-content">
      <div className="static-page">
        <button className="back-btn" onClick={goBack}>← Back to Home</button>
        <h1 className="page-title">{page.title}</h1>
        <div className="page-content" dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    </main>
  );
}

// ============ FOOTER ============

interface FooterProps {
  setCurrentPage: (page: PageType) => void;
}

function Footer({ setCurrentPage }: FooterProps) {
  return (
    <footer className="site-footer">
      <p className="footer-text">© 2024 Sarkari Result | All Rights Reserved</p>
      <div className="footer-links">
        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('about'); }}>About Us</a>
        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('contact'); }}>Contact</a>
        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('privacy'); }}>Privacy Policy</a>
        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('disclaimer'); }}>Disclaimer</a>
      </div>
    </footer>
  );
}

export default App;
