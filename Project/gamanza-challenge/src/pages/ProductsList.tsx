import * as React from 'react';
import {
  Box, Grid, Paper, Stack, Typography, TextField, MenuItem,
  Button, CircularProgress, Alert, Snackbar,
} from '@mui/material';
import {
  useLocation, useNavigate, useSearchParams, Link as RouterLink,
} from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import type { Product } from '../api/types';
import {
  getProducts, searchProducts, getProductsByCategory, getCategories,
} from '../api/products';
import { useOverrides } from '../state/overrides';

export default function ProductsList() {
  // Keep local edits/creates across routes
  const { overrides, setOverride } = useOverrides();

  // Data
  const [products, setProducts] = React.useState<Product[]>([]);
  const [total, setTotal] = React.useState(0);

  // UI
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Router
  const location = useLocation();
  const navigate = useNavigate();
  const { search } = location;

  // Flash + product returned from detail/edit/new
  const navProduct = (location.state as any)?.product as Product | undefined;
  const flash = (location.state as any)?.flash as 'created' | 'updated' | undefined;
  const [snackOpen, setSnackOpen] = React.useState(!!flash);

  // Filters (synced with URL)
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = React.useState(searchParams.get('q') ?? '');
  const [category, setCategory] = React.useState(searchParams.get('category') ?? '');
  const [limit, setLimit] = React.useState(Number(searchParams.get('limit') ?? '10'));
  const [page, setPage] = React.useState(Number(searchParams.get('page') ?? '1'));
  const skip = React.useMemo(() => (page - 1) * limit, [page, limit]);

  // Debounce search
  const [debouncedQ, setDebouncedQ] = React.useState(q);
  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(id);
  }, [q]);

  // Write filters into URL
  React.useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedQ) next.set('q', debouncedQ);
    if (category) next.set('category', category);
    if (page > 1) next.set('page', String(page));
    if (limit !== 10) next.set('limit', String(limit));
    setSearchParams(next, { replace: true });
  }, [debouncedQ, category, page, limit, setSearchParams]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedQ, category, limit]);

  // Categories for left filter
  const [categories, setCategories] = React.useState<string[]>([]);
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

  // Fetch list by filters/pagination
  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        let data: Product[] = [];
        let totalCount = 0;

        if (debouncedQ.trim()) {
          const res = await searchProducts(debouncedQ.trim(), limit, skip);
          data = res.products;
          totalCount = res.total;
          if (category.trim()) data = data.filter(p => p.category === category.trim());
        } else if (category.trim()) {
          const res = await getProductsByCategory(category.trim(), limit, skip);
          data = res.products;
          totalCount = res.total;
        } else {
          const res = await getProducts(limit, skip);
          data = res.products;
          totalCount = res.total;
        }

        // Apply overrides on server items
        const withOverrides = data.map((p) =>
          overrides[p.id] ? { ...p, ...overrides[p.id] } : p
        );

        const idsInPage = new Set(withOverrides.map(p => p.id));
        const extras = Object.values(overrides).filter((p) => {
          const okQ = !debouncedQ || p.title.toLowerCase().includes(debouncedQ.toLowerCase());
          const okCat = !category || p.category === category;
          return !idsInPage.has(p.id) && okQ && okCat;
        });

        const finalList = [...extras, ...withOverrides].slice(0, limit);

        if (mounted) {
          setProducts(finalList);
          setTotal(totalCount); // server total (create is demo)
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [debouncedQ, category, page, limit, skip, overrides]); 
  React.useEffect(() => {
    setProducts((prev) => {
      const byId = new Map(prev.map(p => [p.id, p]));
      // update existing
      for (const p of prev) {
        if (overrides[p.id]) byId.set(p.id, { ...p, ...overrides[p.id] });
      }
      const listIds = new Set(byId.keys());
      const extras = Object.values(overrides).filter((p) => {
        const okQ = !debouncedQ || p.title.toLowerCase().includes(debouncedQ.toLowerCase());
        const okCat = !category || p.category === category;
        return !listIds.has(p.id) && okQ && okCat;
      });
      return [...extras, ...Array.from(byId.values())].slice(0, limit);
    });
  }, [overrides, debouncedQ, category, limit]);

  React.useEffect(() => {
    if (!navProduct) return;
    setOverride(navProduct);
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === navProduct.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...navProduct };
        return copy;
      }
      const okQ = !debouncedQ || navProduct.title.toLowerCase().includes(debouncedQ.toLowerCase());
      const okCat = !category || navProduct.category === category;
      return okQ && okCat ? [navProduct, ...prev].slice(0, limit) : prev;
    });
    navigate({ search: location.search }, { replace: true });
  }, [navProduct, debouncedQ, category, limit, navigate, location.search, setOverride]);

  const clearFilters = () => {
    setQ('');
    setCategory('');
    setPage(1);
  };

  // Loading / error
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

  return (
    <Box p={0}>
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

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Box component="aside" sx={{ position: { md: 'sticky' }, top: { md: 16 } }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Filters</Typography>

              <Stack spacing={2}>
                <TextField
                  label="Search"
                  placeholder="Search products..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />

                <TextField
                  select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="">All categories</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Per page"
                  value={String(limit)}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                >
                  {[5, 10, 20, 40].map((n) => (
                    <MenuItem key={n} value={String(n)}>{n}</MenuItem>
                  ))}
                </TextField>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="outlined" onClick={clearFilters} disabled={!q && !category}>Clear</Button>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h5">Products</Typography>
            <Button variant="contained"  component={RouterLink} to={{ pathname: '/new', search }}>
                <Typography color="secondary">Create New Product</Typography>
            </Button>
          </Stack>

          {products.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography>No products found.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20 }}>
              {products.map((p) => (
                <Grid item key={p.id} xs={4} sm={4} md={4} lg={4}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          )}

          <Box display="flex" justifyContent="center" mt={3}>
            <Button disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>Prev</Button>
            <Typography sx={{ mx: 2, alignSelf: 'center' }}>
              Page {page} of {Math.max(1, Math.ceil(total / limit))}
            </Typography>
            <Button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
