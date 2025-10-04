// src/App.tsx
import {
  AppBar, Box, Button, CssBaseline, IconButton, Toolbar, Typography, useTheme,
} from '@mui/material';
import {  Brightness4, Brightness7 } from '@mui/icons-material';
import {
  BrowserRouter, Routes, Route, Link as RouterLink, useLocation,
} from 'react-router-dom';
import { useContext } from 'react';
import ProductsList from './pages/ProductsList';
import ProductDetail from './pages/ProductDetail';
import ProductEdit from './pages/ProductEdit';
import ProductNew from './pages/ProductNew';
import { ColorModeContext } from './theme/ColorModeContext';
import { OverridesProvider } from './state/overrides';

export default function App() {
  return (
    <>
      <CssBaseline />
      <BrowserRouter>
        <OverridesProvider>
          <Shell />
        </OverridesProvider>
      </BrowserRouter>
    </>
  );
}

function Shell() {
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const { search } = useLocation(); 

  return (
    <>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography color="secondary" variant="h6" sx={{ flexGrow: 1 }}>
           Gamanza FrontEnd Challenge - Yeiry Arce
          </Typography>

          <Button color="secondary" component={RouterLink} to={{ pathname: "/", search }}>
            Products
          </Button>
       
          <IconButton
            color="secondary"
            aria-label="toggle light/dark mode"
            onClick={colorMode.toggleColorMode}
          >
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Routes>
          <Route path="/" element={<ProductsList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/edit" element={<ProductEdit />} />
          <Route path="/new" element={<ProductNew />} />
        </Routes>
      </Box>
    </>
  );
}

