import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Work, Assessment, CreditCard, TrendingUp } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Job, Result, AdmitCard } from '../types';
import { jobsAPI, resultsAPI, admitCardsAPI } from '../services/api';

const Home: React.FC = () => {
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [latestResults, setLatestResults] = useState<Result[]>([]);
  const [latestAdmitCards, setLatestAdmitCards] = useState<AdmitCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback mock data with correct field names
  const mockJobs: Job[] = [
    { 
      _id: '1', 
      title: 'SSC CGL 2024', 
      organization: 'Staff Selection Commission', 
      location: 'All India',
      jobType: 'government',
      applicationStartDate: '2024-01-15',
      applicationEndDate: '2024-02-15',
      examDate: '2024-03-15',
      eligibility: {
        education: 'Graduation',
        ageLimit: '18-27 years'
      },
      totalPosts: 17727,
      applicationFee: {
        general: 100,
        sc_st: 0,
        obc: 100
      },
      applyOnline: true,
      officialWebsite: 'https://ssc.nic.in',
      description: 'Staff Selection Commission Combined Graduate Level Examination 2024',
      status: 'active',
      featured: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    { 
      _id: '2', 
      title: 'UPSC Civil Services 2024', 
      organization: 'Union Public Service Commission', 
      location: 'All India',
      jobType: 'government',
      applicationStartDate: '2024-02-01',
      applicationEndDate: '2024-03-01',
      examDate: '2024-06-15',
      eligibility: {
        education: 'Graduation',
        ageLimit: '21-32 years'
      },
      totalPosts: 1105,
      applicationFee: {
        general: 200,
        sc_st: 0,
        obc: 200
      },
      applyOnline: true,
      officialWebsite: 'https://upsc.gov.in',
      description: 'Civil Services Examination 2024',
      status: 'active',
      featured: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    { 
      _id: '3', 
      title: 'Railway NTPC 2024', 
      organization: 'Railway Recruitment Board', 
      location: 'All India',
      jobType: 'railway',
      applicationStartDate: '2024-01-28',
      applicationEndDate: '2024-02-28',
      examDate: '2024-04-15',
      eligibility: {
        education: 'Graduation',
        ageLimit: '18-30 years'
      },
      totalPosts: 35281,
      applicationFee: {
        general: 500,
        sc_st: 250,
        obc: 500
      },
      applyOnline: true,
      officialWebsite: 'https://rrbcdg.gov.in',
      description: 'Railway Non-Technical Popular Categories 2024',
      status: 'active',
      featured: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
  ];

  const mockResults: Result[] = [
    { 
      _id: '1', 
      title: 'SSC CGL Result 2023', 
      organization: 'Staff Selection Commission', 
      examName: 'SSC CGL 2023',
      resultType: 'final',
      resultDate: '2024-01-15',
      resultUrl: 'https://ssc.nic.in',
      examDate: '2023-12-15',
      description: 'SSC Combined Graduate Level Final Result 2023',
      important: true,
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    },
    { 
      _id: '2', 
      title: 'IBPS PO Final Result', 
      organization: 'IBPS', 
      examName: 'IBPS PO 2023',
      resultType: 'final',
      resultDate: '2024-01-10',
      resultUrl: 'https://ibps.in',
      examDate: '2023-12-10',
      description: 'IBPS Probationary Officer Final Result',
      important: true,
      createdAt: '2024-01-10T00:00:00.000Z',
      updatedAt: '2024-01-10T00:00:00.000Z'
    },
    { 
      _id: '3', 
      title: 'UP Police Constable Result', 
      organization: 'UP Police', 
      examName: 'UP Police Constable 2023',
      resultType: 'main',
      resultDate: '2024-01-05',
      resultUrl: 'https://uppbpb.gov.in',
      examDate: '2023-11-15',
      description: 'UP Police Constable Written Result 2023',
      important: true,
      createdAt: '2024-01-05T00:00:00.000Z',
      updatedAt: '2024-01-05T00:00:00.000Z'
    },
  ];

  const mockAdmitCards: AdmitCard[] = [
    { 
      _id: '1', 
      title: 'UPSC EPFO Admit Card', 
      organization: 'Union Public Service Commission', 
      examName: 'UPSC EPFO 2024',
      examDate: '2024-02-20',
      downloadStartDate: '2024-02-01',
      downloadEndDate: '2024-02-19',
      admitCardUrl: 'https://upsc.gov.in',
      instructions: 'Carry original ID proof along with admit card',
      important: true,
      createdAt: '2024-02-01T00:00:00.000Z',
      updatedAt: '2024-02-01T00:00:00.000Z'
    },
    { 
      _id: '2', 
      title: 'SSC MTS Hall Ticket', 
      organization: 'Staff Selection Commission', 
      examName: 'SSC MTS 2024',
      examDate: '2024-02-15',
      downloadStartDate: '2024-01-25',
      downloadEndDate: '2024-02-14',
      admitCardUrl: 'https://ssc.nic.in',
      instructions: 'Carry original ID proof along with admit card',
      important: true,
      createdAt: '2024-01-25T00:00:00.000Z',
      updatedAt: '2024-01-25T00:00:00.000Z'
    },
    { 
      _id: '3', 
      title: 'IBPS Clerk Call Letter', 
      organization: 'IBPS', 
      examName: 'IBPS Clerk 2024',
      examDate: '2024-02-10',
      downloadStartDate: '2024-01-20',
      downloadEndDate: '2024-02-09',
      admitCardUrl: 'https://ibps.in',
      instructions: 'Carry original ID proof along with admit card',
      important: true,
      createdAt: '2024-01-20T00:00:00.000Z',
      updatedAt: '2024-01-20T00:00:00.000Z'
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching data from API...');
        
        // Try to fetch real data, but don't fail completely if it doesn't work
        let jobsData = mockJobs;
        let resultsData = mockResults;
        let admitCardsData = mockAdmitCards;

        try {
          const [fetchedJobs, fetchedResults, fetchedAdmitCards] = await Promise.allSettled([
            jobsAPI.getLatestJobs(5),
            resultsAPI.getLatestResults(5),
            admitCardsAPI.getLatestAdmitCards(5),
          ]);

          console.log('📊 API Results:', {
            jobs: fetchedJobs.status,
            results: fetchedResults.status,
            admitCards: fetchedAdmitCards.status
          });

          if (fetchedJobs.status === 'fulfilled' && fetchedJobs.value && fetchedJobs.value.length > 0) {
            jobsData = fetchedJobs.value;
            console.log('✅ Using real jobs data:', jobsData.length, 'jobs');
            console.log('📋 Job titles and IDs:', jobsData.map(job => ({ title: job.title, id: job._id })));
          } else {
            console.log('⚠️ Using mock jobs data');
            console.log('❌ Fetch jobs result:', fetchedJobs);
          }
          
          if (fetchedResults.status === 'fulfilled' && fetchedResults.value && fetchedResults.value.length > 0) {
            resultsData = fetchedResults.value;
            console.log('✅ Using real results data:', resultsData.length, 'results');
          } else {
            console.log('⚠️ Using mock results data');
          }
          
          if (fetchedAdmitCards.status === 'fulfilled' && fetchedAdmitCards.value && fetchedAdmitCards.value.length > 0) {
            admitCardsData = fetchedAdmitCards.value;
            console.log('✅ Using real admit cards data:', admitCardsData.length, 'admit cards');
          } else {
            console.log('⚠️ Using mock admit cards data');
          }
        } catch (apiError) {
          console.warn('❌ API calls failed, using mock data:', apiError);
          setError('Currently showing sample data. Server connection may be unavailable.');
        }
        
        setLatestJobs(jobsData);
        setLatestResults(resultsData);
        setLatestAdmitCards(admitCardsData);
      } catch (err) {
        console.error('❌ Error in fetchData:', err);
        // Even if there's an error, set mock data so page still works
        setLatestJobs(mockJobs);
        setLatestResults(mockResults);
        setLatestAdmitCards(mockAdmitCards);
        setError('Currently showing sample data. Please refresh to try connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // Return original string if date parsing fails
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
        {/* Continue rendering the page content below */}
      </Container>
    );
  }

  return (
    <Box>
      {/* Show warning if using fallback data */}
      {error && (
        <Container sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Container>
      )}
      
      {/* Site Title Section */}
      <Box
        sx={{
          bgcolor: '#1976d2', // Light blue color
          py: 3, // Increased padding from 2 to 3
          textAlign: 'center',
          borderBottom: '1px solid #2196f3', // Darker blue border
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'white' }}>
            Sitamarhi Job
          </Typography>
          <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ fontWeight: 'bold', color: 'white' }} // Make subtitle bold
          >
            Your Gateway to Government Jobs, Admit Cards, Answer Keys & Results
          </Typography>
        </Container>
      </Box>

      {/* Primary Navigation - Red Bar */}
      <Box 
        sx={{ 
          bgcolor: '#d32f2f', // Red color
          color: 'white',
          py: 1, // Decreased padding from 1.5 to 1
          px: 2,
          boxShadow: 2,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          borderRadius: 0, // Remove rounded corners for header position
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 0.5, // Decreased padding from 1 to 0.5
              px: 2,
              width: '100%',
            }}
          >
            {/* Navigation bar content */}
        <Box
          component="nav"
          sx={{
            display: 'flex',
            justifyContent: 'center', // Center navigation items
            width: '100%',
            overflow: 'auto',
              whiteSpace: 'nowrap',
              '&::-webkit-scrollbar': {
                display: 'none' // Hide scrollbar
              },
            }}
          >
            <Box component="ul" sx={{ 
              display: 'flex', 
              listStyle: 'none', 
              m: 0, 
              p: 0,
              gap: { xs: 3, md: 5 }, // Increase the spacing (adjust values as needed)
              alignItems: 'center', // Center items vertically
              justifyContent: 'center', // Center items horizontally
            }}>
              <Box component="li">
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                  Home
                </Link>
              </Box>
              <Box component="li">
                <Link to="/admit-cards" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                  Admit Card
                </Link>
              </Box>
              <Box component="li">
                <Link to="/jobs" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                  Latest Job
                </Link>
              </Box>
              <Box component="li">
                <Link to="/results" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                  Latest Result
                </Link>
              </Box>
              <Box component="li">
                <Link to="/answer-keys" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                  Answer Key
                </Link>
              </Box>
              {/* other navigation items */}

              {/* Search Bar */}
              <Box component="li">
                <IconButton 
                aria-label="search"
                onClick={() => {/* Handle search click */}}
                sx={{
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)', // Lighten on hover
                  }
                }}
              >
                <SearchIcon />
              </IconButton>
            </Box>
            </Box>
          </Box>
          </Box>
        </Container>
      </Box>

      {/* Live Update Section */}
      <Box 
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Center the content
          bgcolor: '#f5f5f5', // Light gray background
          py: 1,
          px: 2,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Blinking Red Circle */}
            <Box 
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'red',
                animation: 'blink 1s infinite', // Add blinking animation
                mr: 1.5, // Margin to the right of the circle
              }}
            />
            {/* Live Update Text */}
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000000' }}>
              Live Update
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Hero Section - Removed duplicate title and subtitle */}

      {/* Three Column Quick Links Section */}
      <Container sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 3,
            mb: 6,
          }}
        >
          {/* Results Column */}
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom 
                align="center" 
                sx={{ 
                  fontWeight: 'bold',
                  bgcolor: '#d32f2f',
                  color: 'white',
                  py: 1,
                  px: 2,
                  borderRadius: 1,
                  mb: 2
                }}
              >
                Latest Results
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" component="div">
                  <ul style={{ paddingLeft: '20px' }}>
                    <li>SSC CGL Result 2024</li>
                    <li>UPSC Civil Services 2024</li>
                    <li>IBPS PO Final Result</li>
                    <li>Railway NTPC Result</li>
                    <li>UP Police Constable Result</li>
                  </ul>
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Admit Cards Column */}
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom 
                align="center" 
                sx={{ 
                  fontWeight: 'bold',
                  bgcolor: '#d32f2f',
                  color: 'white',
                  py: 1,
                  px: 2,
                  borderRadius: 1,
                  mb: 2
                }}
              >
                Admit Cards
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" component="div">
                  <ul style={{ paddingLeft: '20px' }}>
                    <li>UPSC EPFO Admit Card</li>
                    <li>SSC MTS Hall Ticket</li>
                    <li>IBPS Clerk Call Letter</li>
                    <li>Railway Group D Admit Card</li>
                    <li>State PSC Hall Ticket</li>
                  </ul>
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* New Online Forms Column */}
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom 
                align="center" 
                sx={{ 
                  fontWeight: 'bold',
                  bgcolor: '#d32f2f',
                  color: 'white',
                  py: 1,
                  px: 2,
                  borderRadius: 1,
                  mb: 2
                }}
              >
                New Online Forms
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" component="div">
                  <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
                    {latestJobs.slice(0, 5).map((job) => (
                      <li key={job._id} style={{ marginBottom: '8px' }}>
                        <Link 
                          to={`/jobs/${job._id}`} 
                          style={{ 
                            color: '#1976d2', 
                            textDecoration: 'none',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: '#d32f2f',
                              display: 'inline-block',
                              mr: 1,
                              animation: job.status === 'active' ? 'blink 2s infinite' : 'none'
                            }}
                          />
                          {job.title}
                          {job.status === 'active' && (
                            <Chip 
                              label="ACTIVE" 
                              size="small" 
                              color="success" 
                              sx={{ ml: 1, fontSize: '10px', height: '16px' }}
                            />
                          )}
                        </Link>
                      </li>
                    ))}
                    {latestJobs.length === 0 && (
                      <>
                        <li style={{ marginBottom: '8px' }}>
                          <Link to="/jobs" style={{ color: '#1976d2', textDecoration: 'none' }}>
                            SSC MTS 2024 Application
                          </Link>
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                          <Link to="/jobs" style={{ color: '#1976d2', textDecoration: 'none' }}>
                            UPSC Civil Services 2025
                          </Link>
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                          <Link to="/jobs" style={{ color: '#1976d2', textDecoration: 'none' }}>
                            Railway NTPC 2024
                          </Link>
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                          <Link to="/jobs" style={{ color: '#1976d2', textDecoration: 'none' }}>
                            Bank PO Recruitment
                          </Link>
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                          <Link to="/jobs" style={{ color: '#1976d2', textDecoration: 'none' }}>
                            Teaching Jobs 2024
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </Typography>
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
              <Button 
                component={Link} 
                to="/jobs" 
                size="small" 
                variant="outlined"
                color="primary"
              >
                View All Forms
              </Button>
            </CardActions>
          </Card>
        </Box>

        {/* Newsletter Subscription */}
        <Box sx={{ mb: 6, bgcolor: 'primary.light', borderRadius: 2, p: 4, textAlign: 'center' }}>
          <Typography variant="h5" component="h2" gutterBottom color="white">
            Stay Updated with Latest Job Notifications
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }} color="white">
            Subscribe to our newsletter and never miss any government job opportunity
          </Typography>
          <Button variant="contained" color="secondary" size="large">
            Subscribe Now
          </Button>
        </Box>

        {/* Footer Links */}
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 4, pb: 2 }}>
          <Typography variant="h6" gutterBottom align="center">
            Quick Links
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Button component={Link} to="/jobs" color="inherit" size="small">Latest Jobs</Button>
            <Button component={Link} to="/results" color="inherit" size="small">Results</Button>
            <Button component={Link} to="/admit-cards" color="inherit" size="small">Admit Cards</Button>
            <Button component={Link} to="/syllabus" color="inherit" size="small">Syllabus</Button>
            <Button component={Link} to="/answer-keys" color="inherit" size="small">Answer Keys</Button>
            <Button component={Link} to="/contact" color="inherit" size="small">Contact Us</Button>
          </Box>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Sitamarhi Job Portal. All Rights Reserved.
          </Typography>
        </Box>
      </Container>

      {/* CSS for Blinking Animation */}
      <style>
        {`
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default Home;
