import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.dark',
        color: 'white',
        mt: 'auto',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 4,
          }}
        >
          {/* Company Info */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Sitamarhi Job
            </Typography>
            <Typography variant="body2" paragraph>
              Your trusted source for the latest government job notifications, 
              exam results, and admit card downloads.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit" href="#" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" href="#" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" href="#" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" href="#" aria-label="LinkedIn">
                <LinkedIn />
              </IconButton>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component={RouterLink}
                to="/jobs"
                color="inherit"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Latest Jobs
              </Link>
              <Link
                component={RouterLink}
                to="/results"
                color="inherit"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Results
              </Link>
              <Link
                component={RouterLink}
                to="/admit-cards"
                color="inherit"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Admit Cards
              </Link>
              <Link
                component={RouterLink}
                to="/about"
                color="inherit"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                About Us
              </Link>
            </Box>
          </Box>

          {/* Job Categories */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Job Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component={RouterLink}
                to="/jobs?jobType=government"
                color="inherit"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Government Jobs
              </Link>
              <Link
                component={RouterLink}
                to="/jobs?jobType=railway"
                color="inherit"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Railway Jobs
              </Link>
              <Link
                component={RouterLink}
                to="/jobs?jobType=banking"
                color="inherit"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Banking Jobs
              </Link>
              <Link
                component={RouterLink}
                to="/jobs?jobType=defense"
                color="inherit"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Defense Jobs
              </Link>
            </Box>
          </Box>

          {/* Contact Info */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2">
                  info@sarkariresults.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2">
                  +91 12345 67890
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                  New Delhi, India
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
          }}
        >
          <Typography variant="body2" color="inherit">
            © {currentYear} Sitamarhi Job. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              component={RouterLink}
              to="/privacy"
              color="inherit"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Privacy Policy
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              color="inherit"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Terms of Service
            </Link>
            <Link
              component={RouterLink}
              to="/contact"
              color="inherit"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Contact
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
