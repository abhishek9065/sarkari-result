import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CalendarToday,
  Work,
  LocationOn,
  School,
  Payment,
  Link as LinkIcon,
  Download,
  Group,
} from '@mui/icons-material';
import { Job } from '../types';
import { jobsAPI } from '../services/api';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchJob(id);
    }
  }, [id]);

  const fetchJob = async (jobId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching job with ID:', jobId);
      
      const response = await jobsAPI.getJob(jobId);
      console.log('✅ Job fetched successfully:', response);
      
      // The API returns the job directly, not in a data property
      setJob(response);
    } catch (err: any) {
      console.error('❌ Error fetching job:', {
        jobId,
        error: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 404) {
        setError(`Job with ID "${jobId}" not found. This might be mock data that doesn't exist in the database.`);
      } else if (err.response?.status === 500) {
        setError('Server error occurred while fetching job details.');
      } else {
        setError(`Failed to load job details: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading job details...
        </Typography>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Job not found'}
        </Alert>
        <Button component={Link} to="/jobs" variant="contained">
          Back to Jobs
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {job.title}
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              {job.organization}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              <Chip 
                label={job.jobType.toUpperCase()} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={job.status.toUpperCase()} 
                color={job.status === 'active' ? 'success' : 'default'}
              />
              {job.featured && (
                <Chip label="FEATURED" color="secondary" />
              )}
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<LinkIcon />}
              href={job.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mb: 1 }}
            >
              Apply Now
            </Button>
            {job.notificationUrl && (
              <Button
                variant="outlined"
                startIcon={<Download />}
                href={job.notificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ml: 1 }}
              >
                Download Notification
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Main Content */}
        <Box sx={{ flex: { xs: 1, md: 2 } }}>
          {/* Job Overview */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Overview
              </Typography>
              <Typography variant="body1" paragraph>
                {job.description}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Group sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Total Posts
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {job.totalPosts}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Location
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {job.location}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Eligibility Criteria */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Eligibility Criteria
              </Typography>
              <List dense>
                <ListItem>
                  <School sx={{ mr: 2, color: 'primary.main' }} />
                  <ListItemText
                    primary="Education Qualification"
                    secondary={job.eligibility.education}
                  />
                </ListItem>
                <ListItem>
                  <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
                  <ListItemText
                    primary="Age Limit"
                    secondary={job.eligibility.ageLimit}
                  />
                </ListItem>
                {job.eligibility.experience && (
                  <ListItem>
                    <Work sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText
                      primary="Experience"
                      secondary={job.eligibility.experience}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Application Fees */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Fees
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    General/OBC
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ₹{job.applicationFee.general}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    SC/ST
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ₹{job.applicationFee.sc_st}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    OBC
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ₹{job.applicationFee.obc}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar */}
        <Box sx={{ flex: { xs: 1, md: 1 } }}>
          {/* Important Dates */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Important Dates
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Application Start Date"
                    secondary={formatDate(job.applicationStartDate)}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Application End Date"
                    secondary={
                      <Typography 
                        color={new Date(job.applicationEndDate) < new Date() ? 'error' : 'success'}
                        fontWeight="bold"
                      >
                        {formatDate(job.applicationEndDate)}
                      </Typography>
                    }
                  />
                </ListItem>
                {job.examDate && (
                  <>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Exam Date"
                        secondary={formatDate(job.examDate)}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<LinkIcon />}
                  href={job.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Official Website
                </Button>
                {job.notificationUrl && (
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Download />}
                    href={job.notificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Notification
                  </Button>
                )}
                <Button
                  variant="outlined"
                  component={Link}
                  to="/jobs"
                  fullWidth
                >
                  View More Jobs
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default JobDetail;
