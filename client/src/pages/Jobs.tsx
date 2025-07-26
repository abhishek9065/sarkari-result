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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Job, JobFilters, ApiResponse } from '../types';
import { jobsAPI } from '../services/api';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    jobType: '',
    location: '',
    status: 'active',
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<Job[]> = await jobsAPI.getJobs(filters);
      setJobs(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof JobFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? Number(value) : 1,
    }));
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // Search is handled automatically by useEffect when filters change
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const jobTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'government', label: 'Government' },
    { value: 'railway', label: 'Railway' },
    { value: 'banking', label: 'Banking' },
    { value: 'defense', label: 'Defense' },
    { value: 'teaching', label: 'Teaching' },
    { value: 'psu', label: 'PSU' },
    { value: 'other', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'closed', label: 'Closed' },
    { value: '', label: 'All Status' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Government Jobs
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Find the latest government job opportunities across India
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr 1fr auto' },
              gap: 2,
              alignItems: 'end',
            }}
          >
            <TextField
              label="Search jobs..."
              variant="outlined"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
            
            <FormControl variant="outlined">
              <InputLabel>Job Type</InputLabel>
              <Select
                value={filters.jobType || ''}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                label="Job Type"
              >
                {jobTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Location"
              variant="outlined"
              value={filters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />

            <FormControl variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              startIcon={<FilterList />}
              sx={{ minWidth: 'auto' }}
            >
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : jobs.length === 0 ? (
        <Alert severity="info">No jobs found matching your criteria.</Alert>
      ) : (
        <>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Showing {jobs.length} of {pagination.total} jobs
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
              gap: 3,
              mb: 4,
            }}
          >
            {jobs.map((job) => (
              <Card key={job._id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {job.title}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {job.organization}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    📍 {job.location}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    💼 {job.totalPosts} Posts
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                      label={job.jobType} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      label={job.status} 
                      size="small" 
                      color={job.status === 'active' ? 'success' : job.status === 'upcoming' ? 'warning' : 'default'}
                    />
                    {job.featured && <Chip label="Featured" size="small" color="secondary" />}
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    📅 Apply Before: {formatDate(job.applicationEndDate)}
                  </Typography>
                  {job.examDate && (
                    <Typography variant="body2" color="textSecondary">
                      📝 Exam Date: {formatDate(job.examDate)}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    component={Link}
                    to={`/jobs/${job._id}`}
                    size="small"
                    variant="outlined"
                  >
                    View Details
                  </Button>
                  {job.applyOnline && job.status === 'active' && (
                    <Button
                      href={job.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      variant="contained"
                    >
                      Apply Now
                    </Button>
                  )}
                </CardActions>
              </Card>
            ))}
          </Box>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={(event, page) => handleFilterChange('page', page)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Jobs;
