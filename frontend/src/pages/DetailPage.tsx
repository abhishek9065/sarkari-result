import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, Navigation, Footer, SectionTable, SkeletonLoader, ShareButtons } from '../components';
import { useAuth } from '../context/AuthContext';
import { API_BASE, formatDate, getDaysRemaining, isExpired, isUrgent, TYPE_LABELS, SELECTION_MODES, type TabType } from '../utils';
import type { Announcement, ContentType } from '../types';

interface DetailPageProps {
    type?: ContentType;
}

export function DetailPage({ type: propType }: DetailPageProps = {}) {
    const { type: paramType, slug } = useParams<{ type: ContentType, slug: string }>();
    const type = propType || paramType || 'job'; // Fallback to 'job' or handle error
    const [item, setItem] = useState<Announcement | null>(null);
    const [relatedItems, setRelatedItems] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!slug) return;

        setLoading(true);
        // Fetch by slug
        fetch(`${API_BASE}/api/announcements/slug/${slug}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                setItem(data);
                // Fetch related items
                if (data) {
                    fetch(`${API_BASE}/api/announcements?type=${data.type}&limit=5`)
                        .then(res => res.json())
                        .then(related => setRelatedItems(related.filter((r: Announcement) => r.id !== data.id).slice(0, 5)));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="app">
                <Header setCurrentPage={(page) => navigate('/' + page)} user={user} isAuthenticated={isAuthenticated} onLogin={() => { }} onLogout={logout} />
                <main className="main-content"><SkeletonLoader /></main>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="app">
                <Header setCurrentPage={(page) => navigate('/' + page)} user={user} isAuthenticated={isAuthenticated} onLogin={() => { }} onLogout={logout} />
                <main className="main-content">
                    <h1>Not Found</h1>
                    <p>The item you're looking for doesn't exist.</p>
                    <button onClick={() => navigate('/')}>Go Home</button>
                </main>
            </div>
        );
    }

    const labels = TYPE_LABELS[item.type] || TYPE_LABELS['job'];
    const selectionModes = SELECTION_MODES[item.type] || SELECTION_MODES['job'];
    const daysRemaining = getDaysRemaining(item.deadline);

    // Type-specific FAQs
    const getFaqs = () => {
        const base = [
            { q: `${item.organization} ${item.title} कब?`, a: item.deadline ? `तारीख: ${formatDate(item.deadline)}` : 'जल्द घोषित होगी।' },
            { q: 'आवेदन कैसे करें?', a: 'नीचे दिए गए Important Links से आवेदन करें।' },
        ];
        return base;
    };

    const handleRelatedClick = (relatedItem: Announcement) => {
        navigate(`/${relatedItem.type}/${relatedItem.slug}`);
    };

    return (
        <div className="page-with-sidebar">
            <div className="detail-page enhanced-detail">
                <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

                {/* Header Banner */}
                <div className="detail-header-banner">
                    <div className="banner-content">
                        <span className="type-badge">{item.type.toUpperCase()}</span>
                        <h1>{item.title}</h1>
                        <div className="org-badge">🏛️ {item.organization}</div>
                    </div>
                </div>

                {/* Countdown */}
                {daysRemaining !== null && (
                    <div className={`countdown-bar ${isExpired(item.deadline) ? 'expired' : isUrgent(item.deadline) ? 'urgent' : 'active'}`}>
                        {isExpired(item.deadline) ? (
                            <span>❌ Closed</span>
                        ) : (
                            <>
                                <span>⏰ {daysRemaining} Days Remaining</span>
                                <span>Last: {formatDate(item.deadline)}</span>
                            </>
                        )}
                    </div>
                )}

                {/* Share Buttons */}
                <div style={{ margin: '15px 0' }}>
                    <ShareButtons
                        title={item.title}
                        description={item.organization}
                    />
                </div>

                {/* Brief Summary */}
                <div className="brief-summary">
                    <h3>📋 Brief Information</h3>
                    <p>
                        <strong>{item.organization}</strong> has released notification for <strong>{item.title}</strong>.
                        {item.totalPosts && ` Total ${item.totalPosts} positions.`}
                        {item.deadline && ` Last date: ${formatDate(item.deadline)}.`}
                    </p>
                </div>

                {/* Tables Grid */}
                <div className="detail-tables-grid">
                    <table className="detail-table dates-table">
                        <thead><tr><th colSpan={2}>📅 Important Dates</th></tr></thead>
                        <tbody>
                            <tr><td><strong>Notification</strong></td><td>{formatDate(item.postedAt)}</td></tr>
                            {item.deadline && <tr><td><strong>Last Date</strong></td><td className="date-value deadline">{formatDate(item.deadline)}</td></tr>}
                        </tbody>
                    </table>

                    <table className="detail-table fee-table">
                        <thead><tr><th colSpan={2}>💰 Application Fee</th></tr></thead>
                        <tbody>
                            <tr><td><strong>General/OBC</strong></td><td>{item.applicationFee || '₹ As per notification'}</td></tr>
                            <tr><td><strong>SC/ST</strong></td><td className="fee-value reduced">Exempted/Reduced</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* Mode of Selection */}
                <div className="mode-selection">
                    <h3>{item.type === 'syllabus' ? 'Content Overview' : 'Selection Process'}</h3>
                    <ul className="selection-list">
                        {selectionModes.map((mode, idx) => <li key={idx}>{mode}</li>)}
                    </ul>
                </div>

                {/* Important Links */}
                <table className="links-table enhanced">
                    <thead><tr><th colSpan={2}>🔗 Important Links</th></tr></thead>
                    <tbody>
                        <tr>
                            <td><strong>{labels.action}</strong></td>
                            <td><a href={item.externalLink || '#'} target="_blank" rel="noreferrer" className="link-btn apply">Click Here</a></td>
                        </tr>
                        <tr>
                            <td><strong>Official Website</strong></td>
                            <td><a href={item.externalLink || '#'} target="_blank" rel="noreferrer" className="link-btn website">Click Here</a></td>
                        </tr>
                    </tbody>
                </table>

                {/* FAQ */}
                <div className="faq-section">
                    <h3>❓ FAQ</h3>
                    {getFaqs().map((faq, idx) => (
                        <div key={idx} className={`faq-item ${openFaq === idx ? 'open' : ''}`}>
                            <button className="faq-question" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                                <span>Q: {faq.q}</span>
                                <span className="faq-toggle">{openFaq === idx ? '−' : '+'}</span>
                            </button>
                            {openFaq === idx && <div className="faq-answer"><strong>A:</strong> {faq.a}</div>}
                        </div>
                    ))}
                </div>
            </div>

            <aside className="sidebar">
                <SectionTable title="Latest" items={relatedItems} onItemClick={handleRelatedClick} />
            </aside>
        </div>
    );
}
