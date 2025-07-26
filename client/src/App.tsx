import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Results from './pages/Results';
import ResultDetail from './pages/ResultDetail';
import AdmitCards from './pages/AdmitCards';
import AdmitCardDetail from './pages/AdmitCardDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      dark: '#115293',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            {/* Header removed from Home page, still visible on other pages */}
            <Routes>
              {/* This is a "Routes hack" to conditionally render the header */}
              <Route path="/" element={null} />
              <Route path="*" element={<Header />} />
            </Routes>
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/results" element={<Results />} />
                <Route path="/results/:id" element={<ResultDetail />} />
                <Route path="/admit-cards" element={<AdmitCards />} />
                <Route path="/admit-cards/:id" element={<AdmitCardDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </AuthProvider>
      <Analytics />
    </ThemeProvider>
  );
}

export default App;
