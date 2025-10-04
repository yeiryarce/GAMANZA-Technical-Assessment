import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material'; 
type Mode = 'light' | 'dark';
export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const PALETTES = {
  light: {
    primary: {  main: '#f38b00'},
    secondary:{  main: '#fff'},
    background:{ default: '#fff', paper: '#f5f5f5ff' },
    text: { primary: '#000', secondary: '#4a5163' },
  },
  dark: {
    primary: { main: '#fff'  },
    secondary:{ main: '#000' },
    background:{ default: '#161a22', paper: '#161a22' },
    text: { primary: '#fff', secondary: '#f38b00' },
  },
} as const;

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<Mode>('light');
  const theme = React.useMemo(
    () => createTheme({ palette: { mode, ...PALETTES[mode] } }),
    [mode]
  );

  const value = React.useMemo(
    () => ({ toggleColorMode: () => setMode(m => (m === 'light' ? 'dark' : 'light')) }),
    []
  );

  return (
  <ColorModeContext.Provider value={value}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  </ColorModeContext.Provider>
);
}
