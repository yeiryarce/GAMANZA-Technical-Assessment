import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, Stack, Typography, Alert } from '@mui/material';
import { createProduct } from '../api/products';
import ProductForm, { type ProductFormValues } from './ProductForm';
import { useOverrides } from '../state/overrides';

export default function ProductNew() {
  const navigate = useNavigate();
  const { search } = useLocation();          
  const { setOverride } = useOverrides();     

  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const initialValues: ProductFormValues = {
    title: '',
    price: 0,
    description: '',
    stock: 0,
    brand: '',
    category: '',
  };

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      setSubmitting(true);
      setSubmitError(null);

      // Create (DummyJSON: non-persistent demo)
      const created = await createProduct(values);

      // Keep it in local overlay so list/detail can show it
      if (created) setOverride(created);

      // Prefer detail view with created object in state (preserve filters)
      if (created?.id != null) {
        navigate(
          { pathname: `/products/${created.id}`, search },
          { replace: true, state: { flash: 'created', product: created } }
        );
      } else {
        // Fallback: back to list carrying the new product
        navigate(
          { pathname: '/', search },
          { replace: true, state: { flash: 'created', product: created } }
        );
      }
    } catch {
      setSubmitError('Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">New product</Typography>
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
