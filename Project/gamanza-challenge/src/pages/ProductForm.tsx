import * as React from 'react';
import { Box, Stack, TextField, Button, MenuItem } from '@mui/material';
import type { Product } from '../api/types';
import { getCategories } from '../api/products';

export type ProductFormValues = Pick<
  Product,
  'title' | 'price' | 'description' | 'stock' | 'brand' | 'category'
>;

type Props = {
  initialValues: ProductFormValues;
  submitting?: boolean;
  onSubmit: (values: ProductFormValues) => void;
  onCancel?: () => void;
};

export default function ProductForm({
  initialValues,
  submitting = false,
  onSubmit,
  onCancel,
}: Props) {
  // Single form state
  const [values, setValues] = React.useState<ProductFormValues>(initialValues);

  // Select options
  const [categories, setCategories] = React.useState<string[]>([]);

  // Validation state
  const [errors, setErrors] = React.useState<{ title?: string; price?: string; category?: string }>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof ProductFormValues, boolean>>>({});
  const [submitted, setSubmitted] = React.useState(false);

  // Load categories once
  React.useEffect(() => {
    getCategories()
      .then((raw) => {
        const normalized = (raw as any[]).map((it) =>
          typeof it === 'string' ? it : (it?.slug ?? it?.name ?? String(it))
        );
        setCategories(Array.from(new Set(normalized.filter(Boolean))));
      })
      .catch(() => setCategories([]));
  }, []);

  // Compute errors (pure)
  const computeErrors = (v: ProductFormValues) => {
    const next: typeof errors = {};
    const title = (v.title ?? '').trim();
    if (!title || title.length < 2 || title.length > 100) next.title = 'Title must be 2–100 characters';

    const price = Number(v.price);
    if (Number.isNaN(price)) next.price = 'Price is required';
    else if (price < 0) next.price = 'Price must be ≥ 0';

    const category = (v.category ?? '').trim();
    if (!category) next.category = 'Category is required';
    else if (category.length > 50) next.category = 'Category must be ≤ 50 chars';

    return next;
  };

  // Keep errors in sync
  React.useEffect(() => {
    setErrors(computeErrors(values));
  }, [values]);

  // Reset when initialValues change (Edit vs New)
  React.useEffect(() => {
    setValues(initialValues);
    setTouched({});
    setSubmitted(false);
  }, [initialValues]);

  // Field change
  const handleChange =
    (field: keyof ProductFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const val =
        field === 'price' || field === 'stock'
          ? (raw === '' ? ('' as any) : Number(raw))
          : raw;
      setValues((prev) => ({ ...prev, [field]: val as any }));
    };

  // Field blur
  const handleBlur =
    (field: keyof ProductFormValues) =>
    () => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = computeErrors(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      title: (values.title ?? '').trim(),
      price: Number(values.price ?? 0),
      description: values.description ?? '',
      stock: Number(values.stock ?? 0),
      brand: values.brand ?? '',
      category: (values.category ?? '').trim(),
    });
  };

  // Show error only if touched or after submit
  const showErr = (k: keyof typeof errors) => !!errors[k] && (submitted || !!touched[k]);

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {/* Title */}
        <TextField
          label="Title"
          value={values.title ?? ''}
          onChange={handleChange('title')}
          onBlur={handleBlur('title')}
          error={showErr('title')}
          helperText={showErr('title') ? errors.title : ' '}
          required
        />

        {/* Price */}
        <TextField
          label="Price"
          type="number"
          value={values.price ?? ''}
          onChange={handleChange('price')}
          onBlur={handleBlur('price')}
          error={showErr('price')}
          helperText={showErr('price') ? errors.price : ' '}
          inputProps={{ min: 0, step: '0.01' }}
          required
        />

        {/* Stock (optional) */}
        <TextField
          label="Stock"
          type="number"
          value={values.stock ?? ''}
          onChange={handleChange('stock')}
          onBlur={handleBlur('stock')}
          inputProps={{ min: 0, step: '1' }}
        />

        {/* Brand (optional) */}
        <TextField
          label="Brand"
          value={values.brand ?? ''}
          onChange={handleChange('brand')}
          onBlur={handleBlur('brand')}
        />

        {/* Category (select) */}
        <TextField
          select
          label="Category"
          value={values.category ?? ''}
          onChange={handleChange('category')}
          onBlur={handleBlur('category')}
          error={showErr('category')}
          helperText={showErr('category') ? errors.category : ' '}
          required
        >
          <MenuItem value="">
            <em>Select a category</em>
          </MenuItem>
          {categories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>

        {/* Description */}
        <TextField
          label="Description"
          value={values.description ?? ''}
          onChange={handleChange('description')}
          onBlur={handleBlur('description')}
          multiline
          minRows={3}
        />

        {/* Actions */}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {onCancel && (
            <Button variant="outlined" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={submitting || Object.keys(errors).length > 0}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
