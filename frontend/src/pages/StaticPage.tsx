import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components';
import { useAuth } from '../context/AuthContext';

interface StaticPageProps {
    page: 'about' | 'contact' | 'privacy' | 'disclaimer';
}

const CONTENT = {
    about: {
        title: 'About Us',
        content: `
      <h2>Welcome to Sarkari Result</h2>
      <p>We are your trusted source for government job notifications, exam results, admit cards, and more.</p>
      <h3>Our Mission</h3>
      <p>To provide accurate and timely information about government jobs and examinations to help candidates succeed.</p>
      <h3>What We Offer</h3>
      <ul>
        <li>Latest Government Job Notifications</li>
        <li>Exam Results & Merit Lists</li>
        <li>Admit Cards & Hall Tickets</li>
        <li>Answer Keys</li>
        <li>Syllabus & Exam Patterns</li>
      </ul>
    `
    },
    contact: {
        title: 'Contact Us',
        content: `
      <h2>Get in Touch</h2>
      <p>We'd love to hear from you! Reach out for any queries or suggestions.</p>
      <h3>Email</h3>
      <p>support@sarkariresult.com</p>
      <h3>Social Media</h3>
      <ul>
        <li>WhatsApp: Join our channel for instant updates</li>
        <li>Telegram: @sarkariresult</li>
        <li>Twitter: @sarkariresult</li>
      </ul>
    `
    },
    privacy: {
        title: 'Privacy Policy',
        content: `
      <h2>Privacy Policy</h2>
      <p>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>
      <h3>Information We Collect</h3>
      <ul>
        <li>Email address (for notifications)</li>
        <li>Bookmarked items</li>
        <li>Browser data for analytics</li>
      </ul>
      <h3>How We Use Information</h3>
      <p>We use your information to send job alerts, improve our services, and provide personalized content.</p>
    `
    },
    disclaimer: {
        title: 'Disclaimer',
        content: `
      <h2>Disclaimer</h2>
      <p><strong>Important Notice:</strong></p>
      <ul>
        <li>This is an informational website only.</li>
        <li>We are NOT affiliated with any government organization.</li>
        <li>Always verify information from official sources.</li>
        <li>We are not responsible for any decisions made based on our content.</li>
      </ul>
      <p>For official information, please visit the respective government websites.</p>
    `
    }
};

export function StaticPage({ page }: StaticPageProps) {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();
    const { title, content } = CONTENT[page];

    return (
        <div className="app">
            <Header
                setCurrentPage={(p) => navigate('/' + p)}
                user={user}
                isAuthenticated={isAuthenticated}
                onLogin={() => { }}
                onLogout={logout}
            />

            <main className="main-content">
                <div className="static-page">
                    <h1>{title}</h1>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                    <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
                </div>
            </main>

            <Footer setCurrentPage={(p) => navigate('/' + p)} />
        </div>
    );
}
