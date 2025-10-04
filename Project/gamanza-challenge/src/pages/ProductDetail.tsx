import * as React from 'react';
import { useParams, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Snackbar, Alert, Box, Paper, Stack, Typography, Button, CircularProgress } from '@mui/material';
import { getProduct } from '../api/products';
import type { Product } from '../api/types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { search } = location;

  const stateProduct = (location.state as any)?.product as Product | undefined;
  const flash = (location.state as any)?.flash as 'created' | 'updated' | undefined;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [snackOpen, setSnackOpen] = React.useState(!!flash);

  React.useEffect(() => {
    const pid = Number(id);
    if (!id || Number.isNaN(pid)) {
      setError('Invalid product id');
      setLoading(false);
      return;
    }

    if (stateProduct && stateProduct.id === pid) {
      setProduct(stateProduct);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    getProduct(pid)
      .then((data) => mounted && setProduct(data))
      .catch(() => mounted && setError('Failed to load product'))
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [id, stateProduct]);

  const goBack = () =>
    navigate({ pathname: '/', search }, { state: { flash, product: product ?? undefined } });

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight={240}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={goBack}>Back</Button>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box p={3}>
        <Alert severity="warning">Product not found.</Alert>
        <Button variant="outlined" onClick={goBack}>Back</Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">{product.title}</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={goBack}>Back</Button>
          <Button
            variant="contained"
            component={RouterLink}
            to={{ pathname: `/products/${product.id}/edit`, search }}
            state={{ product }}
          >
            Edit
          </Button>
        </Stack>
      </Stack>

      {flash && (
        <Snackbar
          open={snackOpen}
          autoHideDuration={2500}
          onClose={() => setSnackOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
            {flash === 'created' ? 'Product created' : 'Product updated'}
          </Alert>
        </Snackbar>
      )}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Box sx={{ width: { xs: '100%', md: 360 } }}>
            {product.thumbnail && (
              <Box
                component="img"
                src={product.thumbnail}
                alt={product.title}
                sx={{ width: '100%', borderRadius: 2 }}
              />
            )}
          </Box>

          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">Price</Typography>
            <Typography sx={{ mb: 1 }}>
              {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(product.price ?? 0)}
            </Typography>

            {product.brand && (
              <>
                <Typography variant="subtitle2" color="text.secondary">Brand</Typography>
                <Typography sx={{ mb: 1 }}>{product.brand}</Typography>
              </>
            )}

            {product.category && (
              <>
                <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                <Typography sx={{ mb: 1 }}>{product.category}</Typography>
              </>
            )}

            {product.description && (
              <>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography>{product.description}</Typography>
              </>
            )}
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
