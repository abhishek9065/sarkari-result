import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';

interface JobFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
}

const JOB_CATEGORIES = [
  'Railway Jobs', 'Bank Jobs', 'SSC Jobs', 'UPSC Jobs', 'State Govt Jobs',
  'Central Govt Jobs', 'Police Jobs', 'Teaching Jobs', 'Defense Jobs',
  'PSU Jobs', 'Court Jobs', 'Other Jobs'
];

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Temporary'];

const JobForm: React.FC<JobFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    department: '',
    category: '',
    type: 'Full Time',
    totalPosts: '',
    qualification: { minimum: '' },
    ageLimit: { minimum: '', maximum: '' },
    applicationFee: { general: '', sc: '', st: '', obc: '' },
    importantDates: {
      applicationStartDate: '',
      applicationEndDate: '',
      examDate: '',
    },
    location: { city: '', state: '' },
    howToApply: '',
    applicationLink: '',
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        totalPosts: initialData.totalPosts?.toString() || '',
        ageLimit: {
          minimum: initialData.ageLimit?.minimum?.toString() || '',
          maximum: initialData.ageLimit?.maximum?.toString() || '',
        },
        applicationFee: {
          general: initialData.applicationFee?.general?.toString() || '',
          sc: initialData.applicationFee?.sc?.toString() || '',
          st: initialData.applicationFee?.st?.toString() || '',
          obc: initialData.applicationFee?.obc?.toString() || '',
        },
        importantDates: {
          applicationStartDate: initialData.importantDates?.applicationStartDate?.split('T')[0] || '',
          applicationEndDate: initialData.importantDates?.applicationEndDate?.split('T')[0] || '',
          examDate: initialData.importantDates?.examDate?.split('T')[0] || '',
        },
        qualification: {
          minimum: initialData.qualification?.minimum || '',
        },
        location: {
          city: initialData.location?.city || '',
          state: initialData.location?.state || '',
        },
      });
    } else {
      // Reset form for new job
      setFormData({
        title: '',
        organization: '',
        department: '',
        category: '',
        type: 'Full Time',
        totalPosts: '',
        qualification: { minimum: '' },
        ageLimit: { minimum: '', maximum: '' },
        applicationFee: { general: '', sc: '', st: '', obc: '' },
        importantDates: {
          applicationStartDate: '',
          applicationEndDate: '',
          examDate: '',
        },
        location: { city: '', state: '' },
        howToApply: '',
        applicationLink: '',
        isActive: true,
        isFeatured: false,
      });
    }
  }, [initialData, open]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    // Convert string numbers back to numbers
    const submitData = {
      ...formData,
      totalPosts: parseInt(formData.totalPosts) || 0,
      ageLimit: {
        minimum: parseInt(formData.ageLimit.minimum) || 18,
        maximum: parseInt(formData.ageLimit.maximum) || 35,
      },
      applicationFee: {
        general: parseInt(formData.applicationFee.general) || 0,
        sc: parseInt(formData.applicationFee.sc) || 0,
        st: parseInt(formData.applicationFee.st) || 0,
        obc: parseInt(formData.applicationFee.obc) || 0,
      },
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initialData ? 'Edit Job' : 'Add New Job'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Basic Info */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Job Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Organization"
              value={formData.organization}
              onChange={(e) => handleChange('organization', e.target.value)}
              required
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
              >
                {JOB_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                {JOB_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Total Posts"
              type="number"
              value={formData.totalPosts}
              onChange={(e) => handleChange('totalPosts', e.target.value)}
            />
          </Box>

          {/* Qualification */}
          <TextField
            fullWidth
            label="Minimum Qualification"
            value={formData.qualification.minimum}
            onChange={(e) => handleNestedChange('qualification', 'minimum', e.target.value)}
          />

          {/* Age Limit */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Minimum Age"
              type="number"
              value={formData.ageLimit.minimum}
              onChange={(e) => handleNestedChange('ageLimit', 'minimum', e.target.value)}
            />
            <TextField
              fullWidth
              label="Maximum Age"
              type="number"
              value={formData.ageLimit.maximum}
              onChange={(e) => handleNestedChange('ageLimit', 'maximum', e.target.value)}
            />
          </Box>

          {/* Application Fees */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Fee (General)"
              type="number"
              value={formData.applicationFee.general}
              onChange={(e) => handleNestedChange('applicationFee', 'general', e.target.value)}
            />
            <TextField
              fullWidth
              label="Fee (SC)"
              type="number"
              value={formData.applicationFee.sc}
              onChange={(e) => handleNestedChange('applicationFee', 'sc', e.target.value)}
            />
            <TextField
              fullWidth
              label="Fee (ST)"
              type="number"
              value={formData.applicationFee.st}
              onChange={(e) => handleNestedChange('applicationFee', 'st', e.target.value)}
            />
            <TextField
              fullWidth
              label="Fee (OBC)"
              type="number"
              value={formData.applicationFee.obc}
              onChange={(e) => handleNestedChange('applicationFee', 'obc', e.target.value)}
            />
          </Box>

          {/* Important Dates */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Application Start Date"
              type="date"
              value={formData.importantDates.applicationStartDate}
              onChange={(e) => handleNestedChange('importantDates', 'applicationStartDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Application End Date"
              type="date"
              value={formData.importantDates.applicationEndDate}
              onChange={(e) => handleNestedChange('importantDates', 'applicationEndDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Exam Date"
              type="date"
              value={formData.importantDates.examDate}
              onChange={(e) => handleNestedChange('importantDates', 'examDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Location */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="City"
              value={formData.location.city}
              onChange={(e) => handleNestedChange('location', 'city', e.target.value)}
            />
            <TextField
              fullWidth
              label="State"
              value={formData.location.state}
              onChange={(e) => handleNestedChange('location', 'state', e.target.value)}
            />
          </Box>

          {/* Application Details */}
          <TextField
            fullWidth
            label="How to Apply"
            multiline
            rows={3}
            value={formData.howToApply}
            onChange={(e) => handleChange('howToApply', e.target.value)}
          />

          <TextField
            fullWidth
            label="Application Link"
            value={formData.applicationLink}
            onChange={(e) => handleChange('applicationLink', e.target.value)}
          />

          {/* Status Switches */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
              }
              label="Active"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isFeatured}
                  onChange={(e) => handleChange('isFeatured', e.target.checked)}
                />
              }
              label="Featured"
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : (initialData ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobForm;
