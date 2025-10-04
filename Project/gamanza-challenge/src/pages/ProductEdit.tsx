import * as React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, Stack, Typography, CircularProgress, Alert } from '@mui/material';
import { getProduct, updateProduct } from '../api/products';
import type { Product } from '../api/types';
import ProductForm, { type ProductFormValues } from './ProductForm';
import { useOverrides } from '../state/overrides';

export default function ProductEdit() {
  // Route id
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const navigate = useNavigate();
  const location = useLocation();
  const { search } = location;

  // Product from navigation state (avoid stale API data)
  const stateProduct = (location.state as any)?.product as Product | undefined;

  // Global overrides (keep edits across routes)
  const { setOverride } = useOverrides();

  // Local UI state
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Load product: prefer state, fallback to API
  React.useEffect(() => {
    if (!id || Number.isNaN(productId)) {
      setError('Invalid product id');
      setLoading(false);
      return;
    }

    if (stateProduct && stateProduct.id === productId) {
      setProduct(stateProduct);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    getProduct(productId)
      .then((data) => mounted && setProduct(data))
      .catch(() => mounted && setError('Failed to load product'))
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [id, productId, stateProduct]);

  // Stable initial form values
  const initialValues = React.useMemo<ProductFormValues>(() => {
    if (!product) {
      return { title: '', price: 0, description: '', stock: 0, brand: '', category: '' };
    }
    return {
      title: product.title,
      price: product.price,
      description: product.description,
      stock: product.stock,
      brand: product.brand,
      category: product.category,
    };
  }, [product?.id]); // recompute only when entity changes

  // Submit edit
  const handleSubmit = async (values: ProductFormValues) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setSubmitError(null);

      const updated = await updateProduct(productId, values);

      // Persist locally (API won't)
      setOverride(updated);

      // Go to detail with updated object and keep filters
      navigate(
        { pathname: `/products/${productId}`, search },
        { replace: true, state: { flash: 'updated', product: updated } }
      );
    } catch {
      setSubmitError('Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading / error / not found
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
      </Box>
    );
  }
  if (!product) {
    return (
      <Box p={3}>
        <Alert severity="warning">Product not found.</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Edit product</Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

        <ProductForm
          initialValues={initialValues}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </Paper>
    </Box>
  );
}
