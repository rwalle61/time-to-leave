import { ThemeOptions } from '@mui/material';

export const palette = {
  primary: {
    light: '#c1aefb',
    main: '#a78bfa',
    dark: '#5f48df',
    contrastText: '#fff',
  },
  secondary: {
    light: '#fcbceb',
    main: '#fa8bde',
    dark: '#cc00af',
    contrastText: '#000',
  },
};

export const theme: ThemeOptions = {
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 10,
  },
  palette,
};
