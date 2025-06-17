import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Chat from './pages/Chat';
import Header from './components/Header';

/**
 * Main App component that sets up routing and theme
 * Currently only contains the Chat route as other features were removed
 */
const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Create MUI theme
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2E7D32', // Green shade
        light: '#4CAF50',
        dark: '#1B5E20',
      },
      secondary: {
        main: '#5C6BC0', // Indigo shade
        light: '#7986CB',
        dark: '#3949AB',
      },
      background: {
        default: darkMode ? '#121212' : '#F5F7FA',
        paper: darkMode ? '#1E1E1E' : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#E0E0E0' : '#2D3748',
        secondary: darkMode ? '#A0AEC0' : '#718096',
      },
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  }), [darkMode]);

  // Get base URL from environment variable or default to '/'
  const basename = process.env.PUBLIC_URL || '/';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename={basename}>
        <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="*" element={<Chat />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 