import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';
import { JobPostingForm, type JobDetails } from '../components/admin/JobPostingForm';
import type { Announcement, ContentType } from '../types';

const apiBase = import.meta.env.VITE_API_BASE ?? '';

export function AdminPage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'list' | 'add' | 'detailed' | 'bulk'>('analytics');
    const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('adminToken'));
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);
    const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);

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
    const [editingId, setEditingId] = useState<number | null>(null);
    const [bulkJson, setBulkJson] = useState('');

    // Fetch data
    const refreshData = async () => {
        if (!adminToken) return;
        try {
            const res = await fetch(`${apiBase}/api/announcements`);
            const data = await res.json();
            setAnnouncements(data.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        if (!adminToken) return;

        try {
            const response = await fetch(`${apiBase}/api/announcements/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            if (response.ok) {
                setMessage('Deleted successfully');
                refreshData();
            } else {
                setMessage('Failed to delete');
            }
        } catch (err) {
            setMessage('Error deleting announcement');
        }
    };

    const handleEdit = (item: Announcement) => {
        setFormData({
            title: item.title,
            type: item.type,
            category: item.category,
            organization: item.organization,
            externalLink: item.externalLink || '',
            location: item.location || '',
            deadline: item.deadline ? item.deadline.split('T')[0] : '', // Format date for input
            totalPosts: item.totalPosts ? item.totalPosts.toString() : '',
            minQualification: item.minQualification || '',
            ageLimit: item.ageLimit || '',
            applicationFee: item.applicationFee || '',
        });
        setEditingId(item.id);
        setActiveAdminTab('add');
        setMessage(`Editing: ${item.title}`);
    };

    // Handle login - call real auth API
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Logging in...');
        try {
            const response = await fetch(`${apiBase}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginForm),
            });

            if (response.ok) {
                const result = await response.json();
                const userData = result.data?.user || result.user;
                const authToken = result.data?.token || result.token;

                if (userData?.role === 'admin') {
                    setAdminToken(authToken);
                    localStorage.setItem('adminToken', authToken);
                    setIsLoggedIn(true);
                    setMessage('Login successful!');
                    refreshData();
                } else {
                    setMessage('Access denied. Admin role required.');
                }
            } else {
                const errorResult = await response.json();
                const errorMsg = typeof errorResult.error === 'string'
                    ? errorResult.error
                    : 'Invalid credentials.';
                setMessage(errorMsg);
            }
        } catch (err) {
            setMessage('Login failed. Check your connection.');
        }
    };

    // Handle form submit (create or update announcement)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Processing...');

        if (!adminToken) {
            setMessage('Not authenticated. Please log in again.');
            setIsLoggedIn(false);
            return;
        }

        try {
            const url = editingId
                ? `${apiBase}/api/announcements/${editingId}`
                : `${apiBase}/api/announcements`;

            const method = editingId ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
                body: JSON.stringify({
                    ...formData,
                    totalPosts: formData.totalPosts ? parseInt(formData.totalPosts) : undefined,
                }),
            });

            if (response.ok) {
                setMessage(editingId ? 'Announcement updated successfully!' : 'Announcement created successfully!');
                setFormData({
                    title: '', type: 'job', category: 'Central Government', organization: '',
                    externalLink: '', location: 'All India', deadline: '', totalPosts: '',
                    minQualification: '', ageLimit: '', applicationFee: '',
                });
                setEditingId(null);
                refreshData();
                setActiveAdminTab('list');
            } else {
                setMessage('Failed to save. Note: Admin API requires authentication.');
            }
        } catch (err) {
            setMessage('Error saving announcement.');
        }
    };

    // Check initial token
    if (!isLoggedIn && adminToken) {
        setIsLoggedIn(true);
        refreshData();
    }

    if (!isLoggedIn) {
        return (
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
                        <button type="button" className="admin-btn secondary" onClick={() => navigate('/')}>Back to Home</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>⚙️ Admin Dashboard</h2>
                <div className="admin-tabs">
                    <button className={activeAdminTab === 'analytics' ? 'active' : ''} onClick={() => setActiveAdminTab('analytics')}>
                        📊 Analytics
                    </button>
                    <button className={activeAdminTab === 'list' ? 'active' : ''} onClick={() => setActiveAdminTab('list')}>
                        📋 All Announcements
                    </button>
                    <button className={activeAdminTab === 'add' ? 'active' : ''} onClick={() => setActiveAdminTab('add')}>
                        ➕ Quick Add
                    </button>
                    <button className={activeAdminTab === 'detailed' ? 'active' : ''} onClick={() => setActiveAdminTab('detailed')}>
                        📝 Detailed Post
                    </button>
                    <button className={activeAdminTab === 'bulk' ? 'active' : ''} onClick={() => setActiveAdminTab('bulk')}>
                        📥 Bulk Import
                    </button>
                </div>
                <button className="admin-btn logout" onClick={() => {
                    setIsLoggedIn(false);
                    setAdminToken(null);
                    localStorage.removeItem('adminToken');
                }}>Logout</button>
            </div>

            {message && <p className="form-message">{message}</p>}

            {activeAdminTab === 'analytics' ? (
                <AnalyticsDashboard adminToken={adminToken} />
            ) : activeAdminTab === 'list' ? (
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
                                        <button className="action-btn edit" onClick={() => handleEdit(item)}>Edit</button>
                                        <button className="action-btn delete" onClick={() => handleDelete(item.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : activeAdminTab === 'detailed' ? (
                <div className="admin-form-container">
                    <h3>📝 Detailed Job Posting</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>
                        Create a comprehensive job posting with all details like UP Police example.
                    </p>

                    {/* Basic Info Section */}
                    <div className="basic-info-section" style={{ marginBottom: '20px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                        <h4 style={{ marginBottom: '15px' }}>Basic Information</h4>
                        <div className="form-row two-col">
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. UP Police Constable Recruitment 2026"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Organization *</label>
                                <input
                                    type="text"
                                    value={formData.organization}
                                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                    placeholder="e.g. UPPRPB"
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
                                    <option value="Police">Police</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row two-col">
                            <div className="form-group">
                                <label>Total Posts</label>
                                <input
                                    type="number"
                                    value={formData.totalPosts}
                                    onChange={(e) => setFormData({ ...formData, totalPosts: e.target.value })}
                                    placeholder="e.g. 32679"
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Date to Apply</label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Job Details Form */}
                    <JobPostingForm
                        initialData={jobDetails || undefined}
                        onSubmit={async (details) => {
                            if (!adminToken) {
                                setMessage('Not authenticated');
                                return;
                            }

                            if (!formData.title || !formData.organization) {
                                setMessage('Please fill in Title and Organization in Basic Information');
                                return;
                            }

                            setMessage('Saving...');
                            try {
                                const response = await fetch(`${apiBase}/api/announcements`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${adminToken}`,
                                    },
                                    body: JSON.stringify({
                                        ...formData,
                                        totalPosts: formData.totalPosts ? parseInt(formData.totalPosts) : undefined,
                                        jobDetails: details,
                                    }),
                                });

                                if (response.ok) {
                                    setMessage('Job posting created successfully!');
                                    setFormData({
                                        title: '', type: 'job', category: 'Central Government', organization: '',
                                        externalLink: '', location: 'All India', deadline: '', totalPosts: '',
                                        minQualification: '', ageLimit: '', applicationFee: '',
                                    });
                                    setJobDetails(null);
                                    refreshData();
                                    setActiveAdminTab('list');
                                } else {
                                    const error = await response.json();
                                    setMessage(error.message || 'Failed to save');
                                }
                            } catch (err) {
                                setMessage('Error saving job posting');
                            }
                        }}
                        onCancel={() => setActiveAdminTab('list')}
                    />
                </div>
            ) : activeAdminTab === 'bulk' ? (
                <div className="admin-form-container">
                    <h3>📥 Bulk Import Announcements</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>Paste JSON array of announcements below. Required fields: title, type, category, organization.</p>
                    <textarea
                        value={bulkJson}
                        onChange={(e) => setBulkJson(e.target.value)}
                        placeholder={`{
"announcements": [
  {
    "title": "SSC CGL 2025",
    "type": "job",
    "category": "Central Government",
    "organization": "SSC",
    "totalPosts": 5000
  }
]
}`}
                        style={{
                            width: '100%',
                            height: '300px',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            padding: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            marginBottom: '15px'
                        }}
                    />
                    <button
                        className="admin-btn primary"
                        onClick={async () => {
                            if (!adminToken) {
                                setMessage('Not authenticated');
                                return;
                            }
                            try {
                                const jsonData = JSON.parse(bulkJson);
                                const response = await fetch(`${apiBase}/api/bulk/import`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${adminToken}`,
                                    },
                                    body: JSON.stringify(jsonData),
                                });
                                const result = await response.json();
                                setMessage(result.message || 'Import complete');
                                if (response.ok) {
                                    refreshData();
                                    setBulkJson('');
                                }
                            } catch (err: any) {
                                setMessage('Invalid JSON: ' + err.message);
                            }
                        }}
                    >
                        🚀 Import Announcements
                    </button>
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

                        {/* Rest of form fields - simplified for brevity, assume similar to original */}
                        <div className="form-row two-col">
                            <div className="form-group">
                                <label>Organization *</label>
                                <input
                                    type="text"
                                    value={formData.organization}
                                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                                />
                            </div>
                            <div className="form-group">
                                <label>Age Limit</label>
                                <input
                                    type="text"
                                    value={formData.ageLimit}
                                    onChange={(e) => setFormData({ ...formData, ageLimit: e.target.value })}
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
                                />
                            </div>
                            <div className="form-group">
                                <label>External Link</label>
                                <input
                                    type="url"
                                    value={formData.externalLink}
                                    onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="admin-btn primary">Save Announcement</button>
                            <button type="button" className="admin-btn secondary" onClick={() => setActiveAdminTab('list')}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AdminPage;
