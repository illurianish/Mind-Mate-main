import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Psychology as PsychologyIcon,
  Info as InfoIcon,
  LocalHospital as LocalHospitalIcon,
} from '@mui/icons-material';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode }) => {
  const theme = useTheme();

  const handleAboutClick = () => {
    window.open('https://illurianish.com/', '_blank');
  };

  const handleResourcesClick = () => {
    window.open('https://988lifeline.org/', '_blank');
  };

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={1}
      sx={{ 
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon 
            sx={{ 
              fontSize: 32, 
              color: theme.palette.primary.main 
            }} 
          />
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
            MindMate
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<InfoIcon />}
            color="inherit"
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'action.hover',
              },
              transition: 'all 0.2s'
            }}
            onClick={handleAboutClick}
          >
            About Developer
          </Button>
          <Button
            startIcon={<LocalHospitalIcon />}
            color="inherit"
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'action.hover',
              },
              transition: 'all 0.2s'
            }}
            onClick={handleResourcesClick}
          >
            Crisis Resources
          </Button>
          <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton 
              onClick={onToggleDarkMode}
              sx={{ 
                ml: 1,
                color: darkMode ? 'primary.light' : 'primary.main',
              }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 