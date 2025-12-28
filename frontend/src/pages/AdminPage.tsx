import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components';
import { useAuth } from '../context/AuthContext';

export function AdminPage() {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated, token } = useAuth();

    if (!isAuthenticated || user?.role !== 'admin') {
        return (
            <div className="app">
                <Header
                    setCurrentPage={(page) => navigate('/' + page)}
                    user={user}
                    isAuthenticated={isAuthenticated}
                    onLogin={() => { }}
                    onLogout={logout}
                />
                <main className="main-content">
                    <div className="admin-login-required">
                        <h1>Admin Access Required</h1>
                        <p>Please login with admin credentials to access this page.</p>
                        <button onClick={() => navigate('/')}>Go Home</button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app">
            <Header
                setCurrentPage={(page) => navigate('/' + page)}
                user={user}
                isAuthenticated={isAuthenticated}
                onLogin={() => { }}
                onLogout={logout}
            />

            <main className="main-content">
                <div className="admin-page">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome, {user.name}!</p>

                    <div className="admin-sections">
                        <div className="admin-card">
                            <h3>📝 Manage Announcements</h3>
                            <p>Add, edit, or delete job postings and results.</p>
                        </div>
                        <div className="admin-card">
                            <h3>📊 Analytics</h3>
                            <p>View site statistics and popular content.</p>
                        </div>
                        <div className="admin-card">
                            <h3>👥 Users</h3>
                            <p>Manage registered users and subscriptions.</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer setCurrentPage={(page) => navigate('/' + page)} />
        </div>
    );
}
