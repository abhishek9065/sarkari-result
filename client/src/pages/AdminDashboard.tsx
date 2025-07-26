import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Stack,
  Chip,
} from '@mui/material';
import {
  Work,
  Assignment,
  CardMembership,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import DataTable from '../components/admin/DataTable';
import JobForm from '../components/admin/JobForm';
import { jobsApi, resultsApi, admitCardsApi } from '../services/adminApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [results, setResults] = useState([]);
  const [admitCards, setAdmitCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load data
  useEffect(() => {
    loadJobs();
    loadResults();
    loadAdmitCards();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await jobsApi.getAll();
      setJobs(response.data.jobs || []);
    } catch (error) {
      showSnackbar('Failed to load jobs', 'error');
    }
  };

  const loadResults = async () => {
    try {
      const response = await resultsApi.getAll();
      setResults(response.data.results || []);
    } catch (error) {
      showSnackbar('Failed to load results', 'error');
    }
  };

  const loadAdmitCards = async () => {
    try {
      const response = await admitCardsApi.getAll();
      setAdmitCards(response.data.admitCards || []);
    } catch (error) {
      showSnackbar('Failed to load admit cards', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Job Operations
  const handleAddJob = () => {
    setEditingJob(null);
    setJobFormOpen(true);
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setJobFormOpen(true);
  };

  const handleJobSubmit = async (jobData: any) => {
    setLoading(true);
    try {
      if (editingJob) {
        await jobsApi.update(editingJob._id, jobData);
        showSnackbar('Job updated successfully', 'success');
      } else {
        await jobsApi.create(jobData);
        showSnackbar('Job created successfully', 'success');
      }
      setJobFormOpen(false);
      setEditingJob(null);
      loadJobs();
    } catch (error) {
      showSnackbar('Failed to save job', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobsApi.delete(id);
        showSnackbar('Job deleted successfully', 'success');
        loadJobs();
      } catch (error) {
        showSnackbar('Failed to delete job', 'error');
      }
    }
  };

  // Placeholder functions for Results and Admit Cards
  const handleAddResult = () => {
    showSnackbar('Result form coming soon', 'error');
  };

  const handleEditResult = (result: any) => {
    showSnackbar('Result editing coming soon', 'error');
  };

  const handleDeleteResult = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        await resultsApi.delete(id);
        showSnackbar('Result deleted successfully', 'success');
        loadResults();
      } catch (error) {
        showSnackbar('Failed to delete result', 'error');
      }
    }
  };

  const handleAddAdmitCard = () => {
    showSnackbar('Admit card form coming soon', 'error');
  };

  const handleEditAdmitCard = (admitCard: any) => {
    showSnackbar('Admit card editing coming soon', 'error');
  };

  const handleDeleteAdmitCard = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this admit card?')) {
      try {
        await admitCardsApi.delete(id);
        showSnackbar('Admit card deleted successfully', 'success');
        loadAdmitCards();
      } catch (error) {
        showSnackbar('Failed to delete admit card', 'error');
      }
    }
  };

  // Table columns
  const jobColumns = [
    { id: 'title', label: 'Title', minWidth: 200 },
    { id: 'organization', label: 'Organization', minWidth: 150 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'totalPosts', label: 'Posts', minWidth: 80 },
    {
      id: 'importantDates',
      label: 'Application End',
      minWidth: 120,
      format: (value: any) => 
        value?.applicationEndDate ? new Date(value.applicationEndDate).toLocaleDateString() : 'N/A'
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 80,
      format: (value: boolean) => (
        <Chip 
          label={value ? 'Active' : 'Inactive'} 
          color={value ? 'success' : 'default'} 
          size="small" 
        />
      )
    },
  ];

  const resultColumns = [
    { id: 'title', label: 'Title', minWidth: 200 },
    { id: 'organization', label: 'Organization', minWidth: 150 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'resultType', label: 'Type', minWidth: 120 },
    {
      id: 'resultDate',
      label: 'Result Date',
      minWidth: 120,
      format: (value: string) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
  ];

  const admitCardColumns = [
    { id: 'title', label: 'Title', minWidth: 200 },
    { id: 'organization', label: 'Organization', minWidth: 150 },
    { id: 'category', label: 'Category', minWidth: 120 },
    {
      id: 'examDate',
      label: 'Exam Date',
      minWidth: 120,
      format: (value: string) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      id: 'releaseDate',
      label: 'Release Date',
      minWidth: 120,
      format: (value: string) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon /> Admin Dashboard
        </Typography>

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Work color="primary" />
                <Box>
                  <Typography variant="h6">{jobs.length}</Typography>
                  <Typography color="textSecondary">Total Jobs</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assignment color="secondary" />
                <Box>
                  <Typography variant="h6">{results.length}</Typography>
                  <Typography color="textSecondary">Total Results</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CardMembership color="success" />
                <Box>
                  <Typography variant="h6">{admitCards.length}</Typography>
                  <Typography color="textSecondary">Admit Cards</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DashboardIcon color="warning" />
                <Box>
                  <Typography variant="h6">
                    {jobs.filter((job: any) => job.isActive).length}
                  </Typography>
                  <Typography color="textSecondary">Active Jobs</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Jobs Management" />
            <Tab label="Results Management" />
            <Tab label="Admit Cards Management" />
          </Tabs>
        </Box>

        {/* Jobs Tab */}
        <TabPanel value={tabValue} index={0}>
          <DataTable
            title="Job Listings"
            columns={jobColumns}
            data={jobs}
            onAdd={handleAddJob}
            onEdit={handleEditJob}
            onDelete={handleDeleteJob}
            loading={loading}
          />
        </TabPanel>

        {/* Results Tab */}
        <TabPanel value={tabValue} index={1}>
          <DataTable
            title="Exam Results"
            columns={resultColumns}
            data={results}
            onAdd={handleAddResult}
            onEdit={handleEditResult}
            onDelete={handleDeleteResult}
            loading={loading}
          />
        </TabPanel>

        {/* Admit Cards Tab */}
        <TabPanel value={tabValue} index={2}>
          <DataTable
            title="Admit Cards"
            columns={admitCardColumns}
            data={admitCards}
            onAdd={handleAddAdmitCard}
            onEdit={handleEditAdmitCard}
            onDelete={handleDeleteAdmitCard}
            loading={loading}
          />
        </TabPanel>

        {/* Job Form Dialog */}
        <JobForm
          open={jobFormOpen}
          onClose={() => setJobFormOpen(false)}
          onSubmit={handleJobSubmit}
          initialData={editingJob}
          loading={loading}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>
    </Container>
  );
};

export default AdminDashboard;
