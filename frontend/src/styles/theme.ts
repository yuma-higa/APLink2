import { createTheme } from '@mui/material/styles';

// You can customize the palette, typography, shapes, etc.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#57B8F9', // main blue
      contrastText: '#fff',
    },
    secondary: {
      main: '#222222', // dark gray/black
    },
    background: {
      default: '#F6F8FB', // light gray background
      paper: '#fff',
    },
    text: {
      primary: '#222222',
      secondary: '#57606A', // muted gray for secondary text
    },
  },
  typography: {
    fontFamily: [
      '"Noto Sans JP"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    button: {
      fontWeight: 700,
      borderRadius: 24,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16, // Rounded corners for cards/buttons
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '8px 32px',
          boxShadow: 'none',
        },
        containedPrimary: {
          color: '#FFF',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(87,184,249,0.08)',
        },
      },
    },
  },
});

export default theme;